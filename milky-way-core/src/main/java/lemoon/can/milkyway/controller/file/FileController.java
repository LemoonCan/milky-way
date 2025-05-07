package lemoon.can.milkyway.controller.file;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lemoon.can.milkyway.controller.Result;
import lemoon.can.milkyway.facade.param.FileParam;
import lemoon.can.milkyway.facade.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "上传")
    public ResponseEntity<Result<String>> upload(@RequestParam("file") MultipartFile file,
                                                 @RequestBody @Valid FileParam fileParam) {
        String url = fileService.upload(fileParam, file);
        return ResponseEntity.ok(Result.success(url));
    }

    @GetMapping
    @Operation(summary = "获取资源")
    public ResponseEntity<Resource> download(@RequestParam("fileId") Long fileId) {
        return null;
    }
}
