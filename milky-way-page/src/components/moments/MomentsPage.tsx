import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { RefreshCw, Edit3, Grape, Citrus, Undo2 } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar } from "../Avatar";
import { MomentsList } from "./MomentsList";
import { MomentPublishDialog } from "./MomentPublishDialog";
import NotificationButton from "../NotificationButton";
import NotificationPanel from "../NotificationPanel";
import { useMomentStore } from "../../store/moment";
import { useUserStore } from "../../store/user";
import { useNotificationStore } from "../../store/notification";
import type { UserDetailInfo } from "../../services/user";
import styles from "../../css/moments/MomentsPage.module.css";
import { EmojiText } from "../EmojiText";

// 路由状态类型定义
interface LocationState {
  userInfo?: UserDetailInfo;
}

export const MomentsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [targetUser, setTargetUser] = useState<UserDetailInfo | null>(null);

  // 从路由状态中获取用户信息
  const userInfoFromState = (location.state as LocationState)?.userInfo;

  // 使用统一的 store
  const {
    moments,
    loading,
    error,
    hasNext,
    initialized,
    momentType,
    fetchMoments,
    loadMoreMoments,
    refreshMoments,
    setMomentType,
    resetState,
  } = useMomentStore();

  const { currentUser } = useUserStore();

  const {
    isNotificationPanelOpen,
    toggleNotificationPanel,
    closeNotificationPanel,
    getMomentStats,
    getMomentNotifications,
  } = useNotificationStore();

  // 获取朋友圈专用的通知统计和通知列表
  const momentStats = getMomentStats();
  const momentNotifications = getMomentNotifications();

  // 初始化加载
  useEffect(() => {
    if (momentType === "user" && userId) {
      // 用户模式：显示特定用户的动态
      console.log("moment useEffect", userId);

      // 使用传递的用户信息
      if (userInfoFromState) {
        setTargetUser(userInfoFromState);
      }
    }
    if(currentUser) {
      fetchMoments(userId)
    }
  }, [userId, momentType, currentUser]);

  // 处理动态类型切换（仅主页面模式）
  const handleMomentTypeChange = async (type: "friends" | "mine") => {
    await setMomentType(type);
  };

  // 刷新动态
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshMoments();
    } finally {
      setIsRefreshing(false);
    }
  };

  // 返回朋友圈页面（仅用户模式）
  const handleBack = () => {
    navigate("/main/moments");
  };

  // 处理发布成功
  const handlePublishSuccess = () => {
    setShowPublishDialog(false);
    refreshMoments();
  };

  // 如果是用户模式但没有userId，返回错误页面
  if (momentType === "user" && !userId) {
    return (
      <div className={styles.errorPage}>
        <div className={styles.errorMessage}>用户ID不能为空</div>
        <Button onClick={handleBack} variant="outline">
          返回好友动态
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.momentsPage}>
      {/* 封面背景区域 */}
      <div className={styles.coverSection}>
        <div className={styles.coverBackground}>
          {/* 左上角按钮区域 */}
          <div className={styles.topLeftActions}>
            {momentType === "user" ? (
              // 用户模式：显示返回按钮
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className={styles.iconButton}
                title="返回好友动态"
              >
                <Undo2 size={20} />
              </Button>
            ) : (
              // 主页面模式：显示动态类型切换按钮
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMomentTypeChange("friends")}
                  className={`${styles.iconButton} ${
                    momentType === "friends" ? styles.active : ""
                  }`}
                  title="好友动态"
                >
                  <Grape size={20} />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMomentTypeChange("mine")}
                  className={`${styles.iconButton} ${
                    momentType === "mine" ? styles.active : ""
                  }`}
                  title="我的动态"
                >
                  <Citrus size={20} />
                </Button>
              </>
            )}
          </div>

          {/* 右上角操作按钮 */}
          <div className={styles.topActions}>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`${styles.iconButton} ${
                isRefreshing || loading ? styles.rotating : ""
              }`}
              title="刷新"
            >
              <RefreshCw size={20} />
            </Button>

            {momentType != "user" && (
              // 主页面模式：显示通知按钮
              <NotificationButton
                className={styles.iconButton}
                onClick={toggleNotificationPanel}
                customStats={momentStats}
              />
            )}

            {momentType != "user" && (
              // 主页面模式或当前用户的动态页面：显示发布按钮
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPublishDialog(true)}
                className={styles.iconButton}
                title="发布动态"
              >
                <Edit3 size={20} />
              </Button>
            )}
            {/* 通知面板 - 仅主页面模式显示 */}
            {momentType != "user" && (
              <NotificationPanel
                isOpen={isNotificationPanelOpen}
                onClose={closeNotificationPanel}
                customNotifications={momentNotifications}
                customStats={momentStats}
                title="动态通知"
              />
            )}
          </div>

          {/* 用户信息 - 右下角 */}
          <div className={styles.userInfo}>
            <div className={styles.userDetails}>
              <span className={styles.userName}>
                <EmojiText
                  text={
                    momentType === "user"
                      ? targetUser?.nickName || "未知用户"
                      : currentUser?.nickName || "未登录"
                  }
                  size="1em"
                />
              </span>
            </div>
            <Avatar
              size={64}
              userId={momentType === "user" ? userId : currentUser?.id}
              avatarUrl={
                momentType === "user" ? targetUser?.avatar : currentUser?.id
              }
              className={styles.userAvatar}
            />
          </div>
        </div>
      </div>

      {/* 动态列表 */}
      <MomentsList
        moments={moments}
        loading={loading}
        hasNext={hasNext}
        initialized={initialized}
        error={error}
        onLoadMore={loadMoreMoments}
        onPublish={() => setShowPublishDialog(true)}
        targetUserId={momentType === "user" ? userId : currentUser?.id}
      />

      {/* 发布动态对话框 */}
      <MomentPublishDialog
        open={showPublishDialog}
        onClose={() => setShowPublishDialog(false)}
        onSuccess={handlePublishSuccess}
      />
    </div>
  );
};
