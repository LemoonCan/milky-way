package lemoon.can.milkyway.facade.dto;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * @author lemoon
 * @since 2025/6/6
 */
@Data
public class Slices<T> implements Serializable {
    Boolean hasNext;
    Integer size;
    List<T> data;

    public Slices(List<T> data, Boolean hasNext) {
        this.data = data;
        this.hasNext = hasNext;
        this.size = data.size();
    }
}
