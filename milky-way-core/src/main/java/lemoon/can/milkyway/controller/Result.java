package lemoon.can.milkyway.controller;

import lombok.Data;

/**
 * @author lemoon
 * @since 2025/4/23
 */
@Data
public class Result<T> {
    private String code;
    private String msg;
    private T data;

    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode("success");
        result.setMsg("成功");
        result.setData(data);
        return result;
    }

    public static Result<Void> success() {
        Result<Void> result = new Result<>();
        result.setCode("success");
        result.setMsg("成功");
        return result;
    }


    public static <T> Result<T> fail(String code, String msg) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMsg(msg);
        return result;
    }

    public static <T> Result<T> fail(Errors errors) {
        return fail(errors.name(), errors.getMsg());
    }

    public static <T> Result<T> fail(Errors errors, String msg) {
        return fail(errors.name(), msg);
    }

    public static <T> Result<T> fail(String msg) {
        return fail("fail", msg);
    }
}
