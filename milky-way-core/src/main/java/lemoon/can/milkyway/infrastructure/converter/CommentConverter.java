package lemoon.can.milkyway.infrastructure.converter;

import lemoon.can.milkyway.facade.dto.CommentDTO;
import lemoon.can.milkyway.facade.dto.SimpleUserDTO;
import lemoon.can.milkyway.infrastructure.converter.helper.DateTimeConverterHelper;
import lemoon.can.milkyway.infrastructure.repository.dos.CommentDO;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.*;
import java.util.stream.Collectors;

/**
 * @author lemoon
 * @since 2025/6/6
 */
@Mapper(componentModel = "spring",
        uses = {UserConverter.class, DateTimeConverterHelper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public abstract class CommentConverter {
    public List<CommentDTO> buildTree(List<CommentDO> flatList) {
        Map<Long, CommentDTO> map = flatList.stream()
                .collect(Collectors.toMap(CommentDO::getId, this::toDto));

        List<CommentDTO> roots = new ArrayList<>();

        for (CommentDO comment : flatList) {
            Long parentId = comment.getParentCommentId();
            if (parentId == null) {
                roots.add(map.get(comment.getId()));
            } else {
                CommentDTO parent = map.get(parentId);
                CommentDTO child = map.get(comment.getId());
                if (parent != null) {
                    parent.getReplies().add(child);
                }
            }
        }

        return roots;
    }
    /**
     * 将 CommentDO 转换为 CommentDTO
     *
     * @param comments 评论数据对象
     * @return 评论数据传输对象
     */
    public List<CommentDTO> buildSimpleArray(List<CommentDO> comments) {
        Map<Long, SimpleUserDTO> commentUserMap = new HashMap<>();
        List<CommentDTO> commentDTOS = new ArrayList<>();
        for (CommentDO commentDO : comments) {
            CommentDTO comment = toDto(commentDO);
            commentUserMap.putIfAbsent(comment.getId(), comment.getUser());
            if (Optional.ofNullable(comment.getParentCommentId()).isPresent()) {
                comment.setReplyUser(commentUserMap.get(comment.getParentCommentId()));
            }
            commentDTOS.add(comment);
        }
        return commentDTOS;
    }

    public abstract CommentDTO toDto(CommentDO commentDO);
}
