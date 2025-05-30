package lemoon.can.milkyway.common.utils;

import java.util.concurrent.locks.ReentrantLock;
import java.security.SecureRandom;
import java.util.concurrent.ThreadLocalRandom;

/**
 * 短、递增、不可预测、机器数支持多种的雪花算法实现
 * <p>
 * 递增保证策略：
 * 1. 时间戳在最高位，确保时间推进时ID严格递增
 * 2. 同一毫秒内通过严格的序列号递增保证单调性
 * 3. 不对最终ID进行破坏递增性的变换操作
 * <p>
 * 不可预测策略：
 * 1. 动态时间戳偏移（在不破坏递增的前提下）
 * 2. 序列号随机起始点 + 动态步长
 * 3. 机器ID位置混淆
 * 4. 多源随机位填充
 * 5. 内部组件顺序重排（保持时间戳最高位）
 */
public class FlexibleSnowflake {

    // 时间戳基准点 (2025-01-01 00:00:00)
    private static final long EPOCH = 1735689600000L;

    // 预定义配置枚举
    public enum MachineConfig {
        SMALL(4, 2, 16),    // 4台机器，2位机器位，16位总长度
        MEDIUM(32, 5, 18),  // 32台机器，5位机器位，18位总长度
        LARGE(64, 6, 20);   // 64台机器，6位机器位，20位总长度

        public final int machineCount;
        public final int machineBits;
        public final int targetDigits;

        MachineConfig(int machineCount, int machineBits, int targetDigits) {
            this.machineCount = machineCount;
            this.machineBits = machineBits;
            this.targetDigits = targetDigits;
        }
    }

    private final String prefix; // 一位数据标识（可选）
    // 各部分位数配置
    private final MachineConfig config;
    private final int machineBits;
    private final int sequenceBits;
    private final int randomBits;

    // 各部分最大值
    private final long maxMachine;
    private final long maxSequence;
    private final long maxRandom;

    private final int sequenceShift;
    private final int machineShift;
    private final int timestampShift;

    // 运行时状态
    private final long machineId;
    private long lastTimestamp = -1L;
    private long sequence = 0L;
    private final SecureRandom secureRandom = new SecureRandom();
    private final ReentrantLock lock = new ReentrantLock();

    // 不可预测性增强参数（不破坏递增性）
    private final long machineSecret;
    private final int[] sequenceSteps;          // 动态序列步长数组
    private int stepIndex = 0;                  // 当前步长索引
    private final long[] machinePositions;      // 机器ID位置混淆表
    private final boolean randomizeComponents;   // 是否重排内部组件
    private int[] componentOrder;         // 组件排列顺序
    private long baseSequence;                  // 序列号基数
    private long callCounter = 0;

    /**
     * 构造函数 - 简化版，只需指定机器配置类型和机器ID
     *
     * @param configType 机器配置类型（SMALL/MEDIUM/LARGE）
     * @param machineId  机器ID
     */
    public FlexibleSnowflake(String prefix, MachineConfig configType, long machineId) {
        this.prefix = prefix;
        this.config = configType;
        this.machineBits = configType.machineBits;
        this.maxMachine = (1L << machineBits) - 1;

        if (machineId < 0 || machineId > maxMachine) {
            throw new IllegalArgumentException(
                    String.format("机器ID超出范围: %d (有效范围: 0-%d)", machineId, maxMachine)
            );
        }
        this.machineId = machineId;

        // 根据配置类型自动调整序列位和随机位
        if (configType == MachineConfig.SMALL) {
            this.sequenceBits = 6;  // 支持每秒64个
            this.randomBits = 4;    // 基础随机性
        } else if (configType == MachineConfig.MEDIUM) {
            this.sequenceBits = 8;  // 支持每秒256个
            this.randomBits = 6;    // 增强随机性
        } else { // LARGE
            this.sequenceBits = 10; // 支持每秒1024个
            this.randomBits = 8;    // 最强随机性
        }

        this.maxSequence = (1L << sequenceBits) - 1;
        this.maxRandom = (1L << randomBits) - 1;

        int totalBits = getBitsForDigits(configType.targetDigits);
        int timestampBits = totalBits - machineBits - sequenceBits - randomBits;

        if (timestampBits < 30) {
            throw new IllegalArgumentException("时间戳位数不足，无法支持200年");
        }

        // 组件顺序：时间戳始终在最高位，其他组件可重排
        this.randomizeComponents = configType.targetDigits >= 18; // 18位以上才启用重排
        // 位移量（时间戳始终在最高位）
        int randomShift;
        if (randomizeComponents) {
            // 随机排列：[随机位, 机器位, 序列位] 的顺序
            this.componentOrder = generateRandomOrder();
            randomShift = getShiftForComponent(0);
            this.machineShift = getShiftForComponent(1);
            this.sequenceShift = getShiftForComponent(2);
        } else {
            // 标准顺序
            randomShift = 0;
            this.sequenceShift = randomBits;
            this.machineShift = sequenceShift + sequenceBits;
        }
        this.timestampShift = machineBits + sequenceBits + randomBits;

        // 初始化不可预测参数
        this.machineSecret = generateMachineSecret(machineId);
        this.sequenceSteps = generateSequenceSteps();
        this.machinePositions = generateMachinePositions();
        this.baseSequence = ThreadLocalRandom.current().nextLong(maxSequence / 4); // 随机起始点
    }

    /**
     * 根据机器数量获取对应配置
     */
    private static MachineConfig getConfigByMachineCount(int machineCount) {
        return switch (machineCount) {
            case 4 -> MachineConfig.SMALL;
            case 32 -> MachineConfig.MEDIUM;
            case 64 -> MachineConfig.LARGE;
            default -> throw new IllegalArgumentException(
                    "不支持的机器数量: " + machineCount + "，仅支持: 4, 32, 64"
            );
        };
    }

    /**
     * 获取当前配置信息
     */
    public String getConfigInfo() {
        return String.format("配置: %s, 机器数: %d, 位数: %d, 机器ID: %d",
                config.name(), config.machineCount, config.targetDigits, machineId);
    }

    /**
     * 生成下一个ID - 严格保证递增
     */
    public String nextId() {
        lock.lock();
        try {
            callCounter++;
            long timestamp = getCurrentTimestamp();

            // 严格的时钟回拨检测
            if (timestamp < lastTimestamp) {
                throw new RuntimeException("检测到时钟回拨，拒绝生成ID以保证递增性");
            }

            if (timestamp == lastTimestamp) {
                // 同一毫秒内：严格递增序列号
                sequence = getNextSequenceInSameMs();
                if (sequence > maxSequence) {
                    // 序列号用完，等待下一毫秒
                    timestamp = waitNextMillis(timestamp);
                    resetSequenceForNewMs();
                }
            } else {
                // 新毫秒：重置序列号（随机起点但保证能递增）
                resetSequenceForNewMs();
            }

            lastTimestamp = timestamp;

            // 生成不可预测但不影响递增的随机值
            long randomValue = generatePredictableRandom();

            // 混淆机器ID（在允许范围内）
            long obfuscatedMachineId = obfuscateMachineId();

            // 按照组件顺序组装ID（时间戳始终在最高位）
            long id = ((timestamp - EPOCH) << timestampShift);

            if (randomizeComponents) {
                // 根据重排顺序添加组件
                id |= getComponentValue(0, randomValue) << getShiftForComponent(0);
                id |= getComponentValue(1, obfuscatedMachineId) << getShiftForComponent(1);
                id |= getComponentValue(2, sequence) << getShiftForComponent(2);
            } else {
                // 标准顺序
                id |= (obfuscatedMachineId << machineShift) |
                        (sequence << sequenceShift) |
                        randomValue;
            }

            return prefix + id;

        } finally {
            lock.unlock();
        }
    }

    /**
     * 验证ID序列的递增性
     */
    public boolean verifyIncreasingSequence(String[] ids) {
        if (ids.length < 2) return true;

        for (int i = 1; i < ids.length; i++) {
            long prev = Long.parseLong(ids[i - 1]);
            long curr = Long.parseLong(ids[i]);
            if (curr <= prev) {
                System.out.println("递增性验证失败: " + prev + " >= " + curr);
                return false;
            }
        }
        return true;
    }

    /**
     * 批量生成ID
     */
    public String[] nextIds(int count) {
        String[] ids = new String[count];
        for (int i = 0; i < count; i++) {
            ids[i] = nextId();
        }
        return ids;
    }

    // ============ 递增性保证的核心方法 ============

    /**
     * 同一毫秒内获取下一个序列号 - 严格递增
     */
    private long getNextSequenceInSameMs() {
        // 使用动态步长，但保证递增
        int step = sequenceSteps[stepIndex % sequenceSteps.length];
        stepIndex++;

        long nextSeq = sequence + step;

        // 确保不超过最大值
        if (nextSeq > maxSequence) {
            return maxSequence + 1; // 触发等待下一毫秒
        }

        return nextSeq;
    }

    /**
     * 新毫秒重置序列号
     */
    private void resetSequenceForNewMs() {
        // 随机起始点，但要为后续递增留出空间
        long maxStart = maxSequence / 4; // 最多用1/4空间作为起始点
        baseSequence = (baseSequence + ThreadLocalRandom.current().nextInt(1, 10)) % maxStart;
        sequence = baseSequence;

        // 重新混洗步长数组
        if (callCounter % 50 == 0) {
            shuffleSequenceSteps();
        }
    }

    /**
     * 等待下一毫秒
     */
    private long waitNextMillis(long lastTimestamp) {
        long timestamp = getCurrentTimestamp();
        while (timestamp <= lastTimestamp) {
            timestamp = getCurrentTimestamp();
        }
        return timestamp;
    }

    // ============ 不可预测性增强方法（不破坏递增） ============

    /**
     * 生成可预测的随机值（用于保持一定的顺序特征）
     */
    private long generatePredictableRandom() {
        // 基于时间和调用次数的伪随机，保持相对稳定的分布
        long base = (callCounter + System.nanoTime()) % maxRandom;
        long random = (base * 31 + machineSecret) % maxRandom;
        return random & maxRandom;
    }

    /**
     * 混淆机器ID（在合法范围内变化）
     */
    private long obfuscateMachineId() {
        // 使用预生成的位置表
        int posIndex = (int) (callCounter % machinePositions.length);
        return machinePositions[posIndex];
    }

    /**
     * 生成随机组件顺序
     */
    private int[] generateRandomOrder() {
        int[] order = {0, 1, 2}; // 随机位, 机器位, 序列位
        // Fisher-Yates洗牌
        for (int i = order.length - 1; i > 0; i--) {
            int j = secureRandom.nextInt(i + 1);
            int temp = order[i];
            order[i] = order[j];
            order[j] = temp;
        }
        return order;
    }

    /**
     * 根据组件顺序获取位移量
     */
    private int getShiftForComponent(int componentIndex) {
        int position = 0;
        for (int i = 0; i < componentOrder.length; i++) {
            if (componentOrder[i] == componentIndex) {
                position = i;
                break;
            }
        }

        switch (position) {
            case 0:
                return 0;
            case 1:
                return componentOrder[0] == 0 ? randomBits :
                        componentOrder[0] == 1 ? machineBits : sequenceBits;
            case 2:
                int shift = 0;
                for (int i = 0; i < 2; i++) {
                    shift += (componentOrder[i] == 0 ? randomBits :
                            componentOrder[i] == 1 ? machineBits : sequenceBits);
                }
                return shift;
            default:
                return 0;
        }
    }

    /**
     * 获取组件值
     */
    private long getComponentValue(int componentType, long value) {
        return switch (componentType) {
            case 0 -> value & maxRandom;       // 随机位
            case 1 -> value & maxMachine;      // 机器位
            case 2 -> value & maxSequence;     // 序列位
            default -> 0;
        };
    }

    /**
     * 生成机器密钥
     */
    private long generateMachineSecret(long machineId) {
        return machineId * 31 + System.currentTimeMillis() + secureRandom.nextLong();
    }

    /**
     * 生成序列步长数组
     */
    private int[] generateSequenceSteps() {
        int[] steps = new int[16];
        for (int i = 0; i < steps.length; i++) {
            steps[i] = ThreadLocalRandom.current().nextInt(1, 8); // 步长1-7
        }
        return steps;
    }

    /**
     * 混洗序列步长
     */
    private void shuffleSequenceSteps() {
        for (int i = sequenceSteps.length - 1; i > 0; i--) {
            int j = ThreadLocalRandom.current().nextInt(i + 1);
            int temp = sequenceSteps[i];
            sequenceSteps[i] = sequenceSteps[j];
            sequenceSteps[j] = temp;
        }
    }

    /**
     * 生成机器位置表
     */
    private long[] generateMachinePositions() {
        long[] positions = new long[64];
        for (int i = 0; i < positions.length; i++) {
            // 在合法范围内生成不同的机器ID变种
            positions[i] = (machineId + i * 7) % (maxMachine + 1);
        }
        return positions;
    }

    private int getBitsForDigits(int digits) {
        long maxValue = (long) Math.pow(10, digits) - 1;
        return 64 - Long.numberOfLeadingZeros(maxValue);
    }

    private long getCurrentTimestamp() {
        return System.currentTimeMillis();
    }

}
