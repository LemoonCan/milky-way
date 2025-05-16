package lemoon.can.milkyway.domain.chat;

/**
 * @author lemoon
 * @since 2025/5/16
 */
public interface MessageProcessor<T> {
    void store(T message);
    void push(T message);
}
