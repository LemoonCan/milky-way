package lemoon.can.milkyway.infrastructure.service.query;

import lemoon.can.milkyway.common.utils.security.SecureId;
import lemoon.can.milkyway.facade.dto.MomentDTO;
import lemoon.can.milkyway.facade.dto.SimpleUserDTO;
import lemoon.can.milkyway.facade.dto.Slices;
import lemoon.can.milkyway.facade.service.query.MomentQueryService;
import lemoon.can.milkyway.infrastructure.converter.CommentConverter;
import lemoon.can.milkyway.infrastructure.repository.dos.CommentDO;
import lemoon.can.milkyway.infrastructure.repository.mapper.CommentMapper;
import lemoon.can.milkyway.infrastructure.repository.mapper.LikeMapper;
import lemoon.can.milkyway.infrastructure.repository.mapper.MomentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/6/5
 */
@Service
@RequiredArgsConstructor
public class MomentQueryServiceImpl implements MomentQueryService {
    private final MomentMapper momentMapper;
    private final LikeMapper likeMapper;
    private final CommentMapper commentMapper;
    private final SecureId secureId;
    private final CommentConverter commentConverter;

    @Override
    public Slices<MomentDTO> listFriendMoments(String userId, String lastId, int pageSize) {
        Long realLastId = secureId.decode(lastId, secureId.getMomentSalt());
        List<MomentDTO> moments = momentMapper.listFriendMoments(userId, realLastId, pageSize + 1)
                .stream()
                .map(item -> {
                    MomentDTO dto = new MomentDTO();
                    dto.setId(secureId.encode(item.getId(), secureId.getMomentSalt()));
                    SimpleUserDTO userDTO = new SimpleUserDTO();
                    userDTO.setId(item.getUserId());
                    userDTO.setNickName(item.getUserNickName());
                    userDTO.setAvatar(item.getUserAvatar());
                    dto.setUser(userDTO);
                    dto.setText(item.getText());
                    dto.setMedias(item.getMedias());
                    dto.setLocation(item.getLocation());
                    dto.setLikeCounts(item.getLikeCounts());
                    dto.setCommentCounts(item.getCommentCounts());
                    dto.setCreatTime(item.getCreateTime());

                    // 查询点赞用户信息
                    dto.setLikeUsers(likeMapper.selectLikeUsers(item.getId()));

                    // 查询评论信息
                    List<CommentDO> comments = commentMapper.selectComments(item.getId());
                    dto.setComments(commentConverter.buildTree(comments));

                    return dto;
                })
                .toList();

        boolean hasNext = moments.size() > pageSize;
        if (hasNext) {
            moments.remove(moments.size() - 1);
        }
        return new Slices<>(moments, hasNext);
    }
}
