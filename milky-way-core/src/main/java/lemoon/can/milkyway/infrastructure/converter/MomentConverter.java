package lemoon.can.milkyway.infrastructure.converter;

import lemoon.can.milkyway.domain.share.Moment;
import lemoon.can.milkyway.facade.dto.MomentDTO;
import lemoon.can.milkyway.facade.dto.MomentDescriptionDTO;
import lemoon.can.milkyway.facade.dto.SimpleUserDTO;
import lemoon.can.milkyway.infrastructure.converter.helper.DateTimeConverterHelper;
import lemoon.can.milkyway.infrastructure.converter.helper.SecureIdConverterHelper;
import lemoon.can.milkyway.infrastructure.repository.dos.CommentDO;
import lemoon.can.milkyway.infrastructure.repository.dos.MomentDO;
import lemoon.can.milkyway.infrastructure.repository.mapper.CommentMapper;
import lemoon.can.milkyway.infrastructure.repository.mapper.LikeMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.stream.Collectors;

/**
 * @author lemoon
 * @since 2025/7/5
 */
@Mapper(componentModel = "spring",
        uses = {DateTimeConverterHelper.class, SecureIdConverterHelper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public abstract class MomentConverter {
    @Autowired
    protected LikeMapper likeMapper;
    @Autowired
    protected CommentMapper commentMapper;
    @Autowired
    protected CommentConverter commentConverter;

    @Mapping(target = "id", source = "id", qualifiedByName = "encodeMomentId")
    protected abstract MomentDTO innerToMomentDTO(MomentDO momentDO);

    @Mapping(target = "id", source = "id", qualifiedByName = "encodeMomentId")
    public abstract MomentDTO toMomentDTO(Moment moment);

    @Mapping(target = "id", source = "id", qualifiedByName = "encodeMomentId")
    public abstract MomentDescriptionDTO toMomentDescriptionDTO(MomentDO momentDO);

    public MomentDTO toMomentDTO(MomentDO momentDO) {
        MomentDTO dto = innerToMomentDTO(momentDO);
        SimpleUserDTO userDTO = new SimpleUserDTO();
        userDTO.setId(momentDO.getUserId());
        userDTO.setNickName(momentDO.getUserNickName());
        userDTO.setAvatar(momentDO.getUserAvatar());
        dto.setUser(userDTO);

        // 查询点赞用户信息
        dto.setLikeUsers(likeMapper.selectLikeUsers(momentDO.getId()));

        // 查询评论信息
        List<CommentDO> comments = commentMapper.simpleSelectComments(momentDO.getId());
        dto.setComments(commentConverter.buildSimpleArray(comments));
        return dto;
    }

    public List<MomentDTO> toMomentDTOs(List<MomentDO> momentDOS) {
        return momentDOS.stream()
                .map(this::toMomentDTO)
                .collect(Collectors.toList());
    }
}
