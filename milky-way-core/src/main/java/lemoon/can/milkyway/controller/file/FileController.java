package lemoon.can.milkyway.controller.file;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lemoon.can.milkyway.controller.Result;
import lemoon.can.milkyway.facade.dto.FileDTO;
import lemoon.can.milkyway.facade.dto.FileInfoDTO;
import lemoon.can.milkyway.facade.param.FileParam;
import lemoon.can.milkyway.facade.service.command.FileService;
import lemoon.can.milkyway.common.utils.FileUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
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

    /**
     * 上传文件
     *
     * @param file 文件
     * @return 文件地址
     *
     * 说明：
     * 1. @RequestPart 声明在对象上，支持application/json的数据类型，但目前swagger无对于@RequestPart复杂对象的支持(swagger不会指定content-type，导致处理失败)
     * 2. @ModelAttribute @ParameterObject 可在swagger中以查询参数形式传递
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "上传")
    public ResponseEntity<Result<FileInfoDTO>> upload(@RequestPart MultipartFile file,
                                                      @RequestPart @Valid FileParam fileParam) {
        FileInfoDTO fileInfoDTO = fileService.upload(file, fileParam);
        return ResponseEntity.ok(Result.success(fileInfoDTO));
    }

    /**
     * 访问文件
     * @param fileId 文件ID
     * @return 文件
     */
    @GetMapping("/{fileId}")
    @Operation(summary = "访问")
    public ResponseEntity<Resource> access(@PathVariable String fileId) {
        FileDTO fileDTO = fileService.loadFile(fileId);
        return ResponseEntity.ok()
                .contentType(FileUtil.parseMediaType(fileDTO.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileDTO.getFileName() + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400, s-maxage=86400")
                .header(HttpHeaders.ETAG, "\"" + fileId + "\"")
                .header(HttpHeaders.EXPIRES, java.time.Instant.now().plus(1, java.time.temporal.ChronoUnit.DAYS).toString())
                .body(fileDTO.getResource());
    }

    /**
     * 临时访问文件
     * @param accessCode 访问码
     * @return 文件
     */
    @GetMapping
    @Operation(summary = "访问")
    public ResponseEntity<Resource> temporaryAccess(@RequestParam String accessCode) {
        FileDTO fileDTO = fileService.temporaryLoadFile(accessCode);
        return ResponseEntity.ok()
                .contentType(FileUtil.parseMediaType(fileDTO.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileDTO.getFileName() + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(fileDTO.getResource());
    }
}