package lemoon.can.milkyway.controller.file;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lemoon.can.milkyway.controller.Result;
import lemoon.can.milkyway.facade.dto.FileDTO;
import lemoon.can.milkyway.facade.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * @author lemoon
 * @since 2025/5/1
 */
@RequiredArgsConstructor
@RestController
@RequestMapping("files")
@Tag(name = "file-api", description = "文件相关接口")
public class FileController {
    private final FileService fileService;

    /**
     * 上传文件
     *
     * @param file 文件
     * @return 文件地址
     * <p>
     * 说明：
     * 1. @RequestPart 声明在对象上，支持application/json的数据类型，但目前swagger无对于@RequestPart复杂对象的支持(swagger不会指定content-type，导致处理失败)
     * 2. @ModelAttribute @ParameterObject 可在swagger中以查询参数形式传递
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "上传")
    public ResponseEntity<Result<String>> upload(@RequestPart MultipartFile file) {
        String url = fileService.upload(file);
        return ResponseEntity.ok(Result.success(url));
    }

    @GetMapping("/{accessToken}")
    public ResponseEntity<Resource> access(@PathVariable String accessToken) {
        // 1. 获取文件资源
        FileDTO fileDTO = fileService.loadFileAsResource(accessToken);

        // 2. 获取文件名
        String filename = fileDTO.getFileId();

        // 3. 构建响应头
        return ResponseEntity.ok()
                .contentType(MediaType.valueOf(fileDTO.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(fileDTO.getResource());
    }
}