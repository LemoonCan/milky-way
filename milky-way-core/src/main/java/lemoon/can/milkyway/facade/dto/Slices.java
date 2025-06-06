package lemoon.can.milkyway.facade.dto;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/6/6
 */
public class Slices<T> {
    Boolean hasNext;
    Integer size;
    List<T> data;

    public Slices(List<T> data, Boolean hasNext) {
        this.data = data;
        this.hasNext = hasNext;
        this.size = data.size();
    }
}
