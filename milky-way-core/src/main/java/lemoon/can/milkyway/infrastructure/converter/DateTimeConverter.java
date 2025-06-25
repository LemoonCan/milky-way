package lemoon.can.milkyway.infrastructure.converter;

import org.mapstruct.Named;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * @author lemoon
 * @since 2025/6/25
 */
@Component
public class DateTimeConverter {
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Named("localDateTimeToString")
    public String asString(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(FORMATTER) : null;
    }

    @Named("stringToLocalDateTime")
    public LocalDateTime asLocalDateTime(String dateTime) {
        return dateTime != null ? LocalDateTime.parse(dateTime, FORMATTER) : null;
    }
}
