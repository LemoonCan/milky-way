package lemoon.can.milkyway.infrastructure.service.query;

import lemoon.can.milkyway.facade.dto.MomentDTO;
import lemoon.can.milkyway.facade.dto.Slices;
import lemoon.can.milkyway.facade.service.query.MomentQueryService;
import lemoon.can.milkyway.infrastructure.converter.MomentConverter;
import lemoon.can.milkyway.infrastructure.converter.helper.SecureIdConverterHelper;
import lemoon.can.milkyway.infrastructure.repository.dos.MomentDO;
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
    private final SecureIdConverterHelper secureIdConverterHelper;
    private final MomentConverter momentConverter;

    @Override
    public Slices<MomentDTO> listFriendMoments(String userId, String lastId, int pageSize) {
        Long realLastId = null;
        if (StringUtils.hasLength(lastId)) {
            realLastId = secureIdConverterHelper.decodeMomentId(lastId);
        }
        List<MomentDO> momentDos = momentMapper.listFriendMoments(userId, realLastId, pageSize + 1);
        List<MomentDTO> moments = momentConverter.toMomentDTOs(momentDos);

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
            realLastId = secureIdConverterHelper.decodeMomentId(lastId);
        }
        List<MomentDO> momentDos = momentMapper.listPersonalMoments(userId, realLastId, pageSize + 1);
        List<MomentDTO> moments = momentConverter.toMomentDTOs(momentDos);

        boolean hasNext = moments.size() > pageSize;
        if (hasNext) {
            moments.remove(moments.size() - 1);
        }
        return new Slices<>(moments, hasNext);
    }

    @Override
    public MomentDTO getMoment(String momentId) {
        MomentDO momentDO = momentMapper.selectMomentById(secureIdConverterHelper.decodeMomentId(momentId));
        return momentConverter.toMomentDTO(momentDO);
    }
}
