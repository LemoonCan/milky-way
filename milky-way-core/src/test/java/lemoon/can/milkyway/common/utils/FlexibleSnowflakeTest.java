package lemoon.can.milkyway.common.utils;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class FlexibleSnowflakeTest {

    @Test
    public void testWithSmallConfig() {
        FlexibleSnowflake.MachineConfig config = FlexibleSnowflake.MachineConfig.SMALL;
        int machineId = 0;

        System.out.println("=== 测试配置: " + config.name() + " ===");

        FlexibleSnowflake snowflake = new FlexibleSnowflake(config, machineId);
        System.out.println(snowflake.getConfigInfo());

        // 生成测试ID
        String[] ids = snowflake.nextIds(50);

        System.out.println("生成的ID示例:");
        for (int i = 0; i < 5; i++) {
            System.out.println("ID: " + ids[i] + " (长度: " + ids[i].length() + ")");
        }

        // 严格验证递增性
        boolean isIncreasing = snowflake.verifyIncreasingSequence(ids);
        System.out.println("✓ 严格递增验证: " + (isIncreasing ? "通过" : "失败"));
        assertTrue(isIncreasing, "IDs should be strictly increasing");

        // 唯一性验证
        Set<String> uniqueIds = new HashSet<>(Arrays.asList(ids));
        System.out.println("✓ 唯一性验证: " + uniqueIds.size() + "/" + ids.length);
        assertEquals(ids.length, uniqueIds.size(), "All IDs should be unique");

        // 性能测试
        long startTime = System.currentTimeMillis();
        for (int i = 0; i < 5000; i++) {
            snowflake.nextId();
        }
        long endTime = System.currentTimeMillis();
        double tps = 5000.0 / (endTime - startTime) * 1000;
        System.out.println("✓ 性能测试: " + tps + " TPS");
        assertTrue(tps > 0, "TPS should be positive");
    }

    @Test
    public void testWithMediumConfig() {
        FlexibleSnowflake.MachineConfig config = FlexibleSnowflake.MachineConfig.MEDIUM;
        int machineId = 15;

        System.out.println("=== 测试配置: " + config.name() + " ===");

        FlexibleSnowflake snowflake = new FlexibleSnowflake(config, machineId);
        System.out.println(snowflake.getConfigInfo());

        // 生成测试ID
        String[] ids = snowflake.nextIds(50);

        System.out.println("生成的ID示例:");
        for (int i = 0; i < 5; i++) {
            System.out.println("ID: " + ids[i] + " (长度: " + ids[i].length() + ")");
        }

        // 严格验证递增性
        boolean isIncreasing = snowflake.verifyIncreasingSequence(ids);
        System.out.println("✓ 严格递增验证: " + (isIncreasing ? "通过" : "失败"));
        assertTrue(isIncreasing, "IDs should be strictly increasing");

        // 唯一性验证
        Set<String> uniqueIds = new HashSet<>(Arrays.asList(ids));
        System.out.println("✓ 唯一性验证: " + uniqueIds.size() + "/" + ids.length);
        assertEquals(ids.length, uniqueIds.size(), "All IDs should be unique");

        // 性能测试
        long startTime = System.currentTimeMillis();
        for (int i = 0; i < 5000; i++) {
            snowflake.nextId();
        }
        long endTime = System.currentTimeMillis();
        double tps = 5000.0 / (endTime - startTime) * 1000;
        System.out.println("✓ 性能测试: " + tps + " TPS");
        assertTrue(tps > 0, "TPS should be positive");
    }

    @Test
    public void testWithLargeConfig() {
        FlexibleSnowflake.MachineConfig config = FlexibleSnowflake.MachineConfig.LARGE;
        int machineId = 31;

        System.out.println("=== 测试配置: " + config.name() + " ===");

        FlexibleSnowflake snowflake = new FlexibleSnowflake(config, machineId);
        System.out.println(snowflake.getConfigInfo());

        // 生成测试ID
        String[] ids = snowflake.nextIds(50);

        System.out.println("生成的ID示例:");
        for (int i = 0; i < 5; i++) {
            System.out.println("ID: " + ids[i] + " (长度: " + ids[i].length() + ")");
        }

        // 严格验证递增性
        boolean isIncreasing = snowflake.verifyIncreasingSequence(ids);
        System.out.println("✓ 严格递增验证: " + (isIncreasing ? "通过" : "失败"));
        assertTrue(isIncreasing, "IDs should be strictly increasing");

        // 唯一性验证
        Set<String> uniqueIds = new HashSet<>(Arrays.asList(ids));
        System.out.println("✓ 唯一性验证: " + uniqueIds.size() + "/" + ids.length);
        assertEquals(ids.length, uniqueIds.size(), "All IDs should be unique");

        // 性能测试
        long startTime = System.currentTimeMillis();
        for (int i = 0; i < 5000; i++) {
            snowflake.nextId();
        }
        long endTime = System.currentTimeMillis();
        double tps = 5000.0 / (endTime - startTime) * 1000;
        System.out.println("✓ 性能测试: " + tps + " TPS");
        assertTrue(tps > 0, "TPS should be positive");
    }

    @Test
    public void testWithMachineCount() {
        int machineCount = 32;
        int machineId = 15;

        System.out.println("=== 测试机器数量: " + machineCount + " ===");

        FlexibleSnowflake snowflake = new FlexibleSnowflake(machineCount, machineId);
        System.out.println(snowflake.getConfigInfo());

        String[] ids = snowflake.nextIds(20);
        System.out.println("示例ID: " + ids[0] + " (长度: " + ids[0].length() + ")");
        boolean isIncreasing = snowflake.verifyIncreasingSequence(ids);
        System.out.println("递增验证: " + (isIncreasing ? "✓" : "✗"));
        assertTrue(isIncreasing, "IDs should be strictly increasing");
    }

    @Test
    public void testStrictIncreasing() {
        System.out.println("=== 严格递增性压力测试 ===");
        FlexibleSnowflake snowflake = new FlexibleSnowflake(FlexibleSnowflake.MachineConfig.MEDIUM, 1);

        // 快速生成大量ID测试
        String[] rapidIds = snowflake.nextIds(1000);
        boolean strictIncreasing = snowflake.verifyIncreasingSequence(rapidIds);

        System.out.println("快速生成1000个ID的递增性: " + (strictIncreasing ? "✓ 通过" : "✗ 失败"));
        assertTrue(strictIncreasing, "1000 IDs should be strictly increasing");

        // 显示连续ID的递增差值
        long[] diffs = new long[10];
        for (int i = 1; i < 11; i++) {
            diffs[i - 1] = Long.parseLong(rapidIds[i]) - Long.parseLong(rapidIds[i - 1]);
        }
        System.out.println("前10个连续差值: " + Arrays.toString(diffs));
        boolean allPositive = Arrays.stream(diffs).allMatch(d -> d > 0);
        System.out.println("所有差值均 > 0: " + allPositive);
        assertTrue(allPositive, "All differences between consecutive IDs should be positive");
    }
}
