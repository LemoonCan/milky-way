package lemoon.can.milkyway.controller.file;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lemoon.can.milkyway.controller.Result;
import lemoon.can.milkyway.facade.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * @author lemoon
 * @since 2025/5/1
 */
@RequiredArgsConstructor
@RestController(value = "files")
@Tag(name = "file-api", description = "文件相关接口")
public class FileController {
    private final FileService fileService;
    @PostMapping
    @Operation(summary = "上传")
    public ResponseEntity<Result<String>> upload(@RequestParam("file")MultipartFile file){
        return null;
    }

    @GetMapping
    @Operation(summary = "获取资源")
    public ResponseEntity<Resource> download(@RequestParam("fileId") Long fileId){
        return null;
    }
}
