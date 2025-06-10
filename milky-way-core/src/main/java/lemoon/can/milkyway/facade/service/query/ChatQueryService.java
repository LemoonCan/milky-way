package lemoon.can.milkyway.facade.service.query;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/5/25
 */
public interface ChatQueryService {
    List<String> getGroupChats(String userId);
}
