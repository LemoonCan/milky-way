package lemoon.can.milkyway.infrastructure.converter;

import lemoon.can.milkyway.common.utils.security.SecureId;
import lemoon.can.milkyway.facade.dto.CommentDTO;
import lemoon.can.milkyway.infrastructure.repository.dos.CommentDO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @author lemoon
 * @since 2025/6/6
 */
@Mapper(componentModel = "spring",uses = {UserConverter.class})
public abstract class CommentConverter {
    @Autowired
    private SecureId secureId;

    public List<CommentDTO> buildTree(List<CommentDO> flatList) {
        Map<Long, CommentDTO> map = flatList.stream()
                .collect(Collectors.toMap(CommentDO::getId, this::toDto));

        List<CommentDTO> roots = new ArrayList<>();

        for (CommentDO comment : flatList) {
            Long parentId = comment.getParentCommentId();
            if (parentId == null) {
                roots.add(toDto(comment));
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

    public abstract CommentDTO toDto(CommentDO commentDO);
}
