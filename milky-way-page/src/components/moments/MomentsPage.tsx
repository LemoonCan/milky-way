import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { RefreshCw, Edit3, Grape, Citrus, Undo2 } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar } from "../Avatar";
import { MomentsList } from "./MomentsList";
import type { MomentsListRef } from "./MomentsList";
import { MomentPublishDialog } from "./MomentPublishDialog";
import NotificationButton from "../NotificationButton";
import NotificationPanel from "../NotificationPanel";
import { useMomentStore, MomentType } from "../../store/moment";
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
  // MomentsList 的 ref
  const momentsListRef = useRef<MomentsListRef>(null);

  // 使用统一的 store
  const {
    moments,
    loading,
    hasNext,
    fetchMoments,
    loadMoreMoments,
    navigateToMomentPage,
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

  // 根据路径确定 momentType
  const getMomentTypeFromPath = useCallback((): MomentType => {
    const path = location.pathname;
    if (path.includes("/moments/friend")) return MomentType.FRIEND;
    if (path.includes("/moments/mine")) return MomentType.MINE;
    if (path.includes("/moments/user/")) return MomentType.USER;
    return MomentType.FRIEND; // 默认值
  }, [location.pathname]);

  const momentType = getMomentTypeFromPath();

  // 初始化加载
  useEffect(() => {
    if (momentType === MomentType.USER && userId) {
      if (userInfoFromState) {
        setTargetUser(userInfoFromState);
      }
    }
    if (currentUser) {
      fetchMoments(momentType);
    }
  }, [userId, currentUser, fetchMoments, userInfoFromState, momentType]);

  // 刷新动态
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchMoments(momentType, userId);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 处理发布成功
  const handlePublishSuccess = async () => {
    await fetchMoments(momentType, userId);
    momentsListRef.current?.scrollToTop();
    setShowPublishDialog(false);
  };

  return (
    <div className={styles.momentsPage}>
      {/* 封面背景区域 */}
      <div className={styles.coverSection}>
        <div className={styles.coverBackground}>
          {/* 左上角按钮区域 */}
          <div className={styles.topLeftActions}>
            {momentType === MomentType.USER ? (
              // 用户模式：显示返回按钮
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  navigateToMomentPage(MomentType.FRIEND, navigate)
                }
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
                  onClick={() =>
                    navigateToMomentPage(MomentType.FRIEND, navigate)
                  }
                  className={`${styles.iconButton} ${
                    momentType === MomentType.FRIEND ? styles.active : ""
                  }`}
                  title="好友动态"
                >
                  <Grape size={20} />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    navigateToMomentPage(MomentType.MINE, navigate)
                  }
                  className={`${styles.iconButton} ${
                    momentType === MomentType.MINE ? styles.active : ""
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

            {momentType != MomentType.USER && (
              // 主页面模式：显示通知按钮
              <NotificationButton
                className={styles.iconButton}
                onClick={toggleNotificationPanel}
                customStats={momentStats}
              />
            )}

            {momentType != MomentType.USER && (
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
            {momentType != MomentType.USER && (
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
                    momentType === MomentType.USER
                      ? targetUser?.nickName || "未知用户"
                      : currentUser?.nickName || "未登录"
                  }
                  size="1em"
                />
              </span>
            </div>
            <Avatar
              size={64}
              userId={momentType === MomentType.USER ? userId : currentUser?.id}
              avatarUrl={
                momentType === MomentType.USER
                  ? targetUser?.avatar
                  : currentUser?.avatar
              }
              className={styles.userAvatar}
            />
          </div>
        </div>
      </div>

      {/* 动态列表 */}
      <MomentsList
        ref={momentsListRef}
        moments={moments}
        loading={loading}
        hasNext={hasNext}
        onLoadMore={() => loadMoreMoments(momentType, userId)}
        onPublish={() => setShowPublishDialog(true)}
        targetUserId={momentType === MomentType.USER ? userId : currentUser?.id}
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
