package lemoon.can.milkyway.infrastructure.service.query;

import lemoon.can.milkyway.common.utils.security.SecureId;
import lemoon.can.milkyway.facade.dto.MomentDTO;
import lemoon.can.milkyway.facade.dto.SimpleUserDTO;
import lemoon.can.milkyway.facade.dto.Slices;
import lemoon.can.milkyway.facade.service.query.MomentQueryService;
import lemoon.can.milkyway.infrastructure.converter.CommentConverter;
import lemoon.can.milkyway.infrastructure.converter.MomentConverter;
import lemoon.can.milkyway.infrastructure.repository.dos.CommentDO;
import lemoon.can.milkyway.infrastructure.repository.dos.MomentDO;
import lemoon.can.milkyway.infrastructure.repository.mapper.CommentMapper;
import lemoon.can.milkyway.infrastructure.repository.mapper.LikeMapper;
import lemoon.can.milkyway.infrastructure.repository.mapper.MomentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

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
    private final MomentConverter momentConverter;

    @Override
    public Slices<MomentDTO> listFriendMoments(String userId, String lastId, int pageSize) {
        Long realLastId = null;
        if (StringUtils.hasLength(lastId)) {
            realLastId = secureId.simpleDecode(lastId, secureId.getMomentSalt());
        }
        List<MomentDO> momentDos = momentMapper.listFriendMoments(userId, realLastId, pageSize + 1);

        List<MomentDTO> moments = momentDos.stream()
                .map(item -> {
                    MomentDTO dto = momentConverter.toMomentDTO(item);
                    SimpleUserDTO userDTO = new SimpleUserDTO();
                    userDTO.setId(item.getUserId());
                    userDTO.setNickName(item.getUserNickName());
                    userDTO.setAvatar(item.getUserAvatar());
                    dto.setUser(userDTO);

                    // 查询点赞用户信息
                    dto.setLikeUsers(likeMapper.selectLikeUsers(item.getId()));

                    // 查询评论信息
                    List<CommentDO> comments = commentMapper.simpleSelectComments(item.getId());
                    dto.setComments(commentConverter.buildSimpleArray(comments));

                    return dto;
                })
                .collect(Collectors.toList());

        boolean hasNext = moments.size() > pageSize;
        if (hasNext) {
            moments.remove(moments.size() - 1);
        }
        return new Slices<>(moments, hasNext);
    }

    @Override
    public Slices<MomentDTO> listPersonalMoments(String userId, String lastId, int pageSize) {
        Long realLastId = null;
        if (StringUtils.hasLength(lastId)) {
            realLastId = secureId.simpleDecode(lastId, secureId.getMomentSalt());
        }
        List<MomentDO> momentDos = momentMapper.listPersonalMoments(userId, realLastId, pageSize + 1);

        List<MomentDTO> moments = momentDos.stream()
                .map(item -> {
                    MomentDTO dto = momentConverter.toMomentDTO(item);
                    SimpleUserDTO userDTO = new SimpleUserDTO();
                    userDTO.setId(item.getUserId());
                    userDTO.setNickName(item.getUserNickName());
                    userDTO.setAvatar(item.getUserAvatar());
                    dto.setUser(userDTO);

                    // 查询点赞用户信息
                    dto.setLikeUsers(likeMapper.selectLikeUsers(item.getId()));

                    // 查询评论信息
                    List<CommentDO> comments = commentMapper.simpleSelectComments(item.getId());
                    dto.setComments(commentConverter.buildSimpleArray(comments));

                    return dto;
                })
                .collect(Collectors.toList());

        boolean hasNext = moments.size() > pageSize;
        if (hasNext) {
            moments.remove(moments.size() - 1);
        }
        return new Slices<>(moments, hasNext);
    }
}
