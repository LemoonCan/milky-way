package lemoon.can.milkyway.common.utils;

import lemoon.can.milkyway.common.exception.BusinessException;
import lemoon.can.milkyway.common.exception.ErrorCode;
import net.sourceforge.pinyin4j.PinyinHelper;

/**
 * @author lemoon
 * @since 2025/6/23
 */
public class LanguageUtils {
    public static boolean isChinese(char c) {
        Character.UnicodeBlock ub = Character.UnicodeBlock.of(c);
        return ub == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS
                || ub == Character.UnicodeBlock.CJK_COMPATIBILITY_IDEOGRAPHS
                || ub == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS_EXTENSION_A
                || ub == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS_EXTENSION_B;
    }

    public static Character getFirstLetter(String str) {
        if (str == null || str.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_PARAM, "字符串不能为空");
        }
        char firstChar = str.charAt(0);
        if (isChinese(firstChar)) {
            String[] pinyinArray = PinyinHelper.toHanyuPinyinStringArray(firstChar);
            if (pinyinArray == null || pinyinArray.length == 0) {
                throw new BusinessException(ErrorCode.INVALID_PARAM, "无法获取汉字的拼音");
            }
            return Character.toUpperCase(pinyinArray[0].charAt(0));
        } else {
            return Character.toUpperCase(firstChar);
        }
    }
}
