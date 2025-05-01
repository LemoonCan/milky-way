package lemoon.can.milkyway.utils;

import java.time.Instant;
import java.util.concurrent.atomic.AtomicLong;

/**
 * @author lemoon
 * @since 2025/5/1
 */
public final class Snowflake {

    /* ===== 常量配置 ===== */
    private static final long CUSTOM_EPOCH_MS =
            Instant.parse("2025-05-01T00:00:00Z").toEpochMilli();

    private static final int SEQ_BITS   = 12;               // 0-4095
    private static final int WORKER_BITS = 6;              // 0-63

    private static final long SEQ_MASK   = (1L << SEQ_BITS)   - 1;
    private static final long WORK_MASK  = (1L << WORKER_BITS) - 1;

    private static final int WORK_SHIFT  = SEQ_BITS;
    private static final int TIME_SHIFT  = SEQ_BITS + WORKER_BITS;

    /* ===== 实例字段 ===== */
    private final String prefix;           // 两位业务标识
    private final long   workerId;         // 唯一实例号
    private final AtomicLong lastValue = new AtomicLong(-1L);

    public Snowflake(String prefix, int workerId) {
        if (prefix == null || prefix.length() != 2)
            throw new IllegalArgumentException("prefix must be exactly 2 chars");
        if (workerId < 0 || workerId > WORK_MASK)
            throw new IllegalArgumentException("workerId 0-" + WORK_MASK);

        this.prefix   = prefix.toUpperCase();
        this.workerId = workerId;
    }

    public String nextId() {
        while (true) {
            long nowMs = System.currentTimeMillis();
            long baseTime = nowMs - CUSTOM_EPOCH_MS;

            long prev = lastValue.get();
            long prevTime = (prev < 0) ? -1 : (prev >>> TIME_SHIFT);
            long seq = (prevTime == baseTime) ? ((prev & SEQ_MASK) + 1) : 0;

            if (seq > SEQ_MASK) {                 // 同毫秒已满→跳下一毫秒
                continue;                         // 重试，等待自然进入下一毫秒
            }
            long candidate =  (baseTime << TIME_SHIFT)
                    | (workerId << WORK_SHIFT)
                    | seq;

            if (lastValue.compareAndSet(prev, candidate)) {
                // 转 Base-36，左补 0 到 10 位
                String body = Long.toString(candidate, 36).toUpperCase();
                body = String.format("%10s", body).replace(' ', '0');
                return prefix + body;             // 2 + 10 = 12
            }
            // CAS 失败 → 并发冲突，立即重试
        }
    }

    /* ==== 可选解析，便于调试 ==== */
    public static Parsed parse(String id) {
        if (id == null || id.length() != 16) throw new IllegalArgumentException();
        long raw = Long.parseLong(id.substring(2), 36);
        long seq =  raw        & SEQ_MASK;
        long wid = (raw >>> WORK_SHIFT) & WORK_MASK;
        long ts  = (raw >>> TIME_SHIFT) + CUSTOM_EPOCH_MS;
        return new Parsed(id.substring(0,2), (int)wid, (int)seq, ts);
    }
    public record Parsed(String prefix, int workerId, int seq, long timestampMs){}
}

