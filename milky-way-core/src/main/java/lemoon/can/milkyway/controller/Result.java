package lemoon.can.milkyway.controller;

import lemoon.can.milkyway.common.exception.ErrorCode;
import lombok.Data;

/**
 * @author lemoon
 * @since 2025/4/23
 */
@Data
public class Result<T> {
    private boolean success;
    private String code;
    private String msg;
    private T data;

    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setSuccessInfo();
        result.setData(data);
        return result;
    }

    public static Result<Void> success() {
        Result<Void> result = new Result<>();
        result.setSuccessInfo();
        return result;
    }

    private void setSuccessInfo() {
        this.success = true;
        this.code = "success";
        this.msg = "成功";
    }


    public static <T> Result<T> fail(String code, String msg) {
        Result<T> result = new Result<>();
        result.setSuccess(false);
        result.setCode(code);
        result.setMsg(msg);
        return result;
    }

    public static <T> Result<T> fail(ErrorCode err) {
        return fail(err.name(), err.getMessage());
    }

    public static <T> Result<T> fail(ErrorCode err, String msg) {
        return fail(err.name(), msg);
    }

    public static <T> Result<T> fail(String msg) {
        return fail("fail", msg);
    }
}
