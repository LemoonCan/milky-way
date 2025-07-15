package lemoon.can.milkyway.common.utils;

import lemoon.can.milkyway.common.exception.BusinessException;
import lemoon.can.milkyway.common.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

/**
 * @author lemoon
 * @since 2025/7/15
 */
@Slf4j
public class FfmpegUtil {

    /**
     * 使用FFmpeg截取视频封面图
     *
     * @param videoPath      视频文件路径
     * @param coverImagePath 生成的图片路径
     */
    public static void generateCoverImage(String videoPath, String coverImagePath) {
        // 构造FFmpeg命令：从第1秒开始截一帧图像
        String[] command = {
                "ffmpeg",
                "-ss", "00:00:01",      // 从1秒处开始
                "-i", videoPath,
                "-frames:v", "1",       // 截取1帧
                "-q:v", "2",            // 质量参数，范围1-31，越小越好
                coverImagePath
        };

        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectErrorStream(true); // 合并标准错误和标准输出

        int exitCode;
        try {
            Process process = pb.start();
            // 打印ffmpeg输出，方便调试
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    System.out.println(line);
                }
            }

            exitCode = process.waitFor();
        } catch (IOException | InterruptedException e) {
            log.error("视频封面图生成失败", e);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "视频封面图生成失败");
        }

        if (exitCode != 0) {
            log.error("FFmpeg 进程执行失败，退出码：{}", exitCode);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "视频封面图生成失败");
        }
    }
}
