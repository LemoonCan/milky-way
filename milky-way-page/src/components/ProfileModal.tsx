import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Avatar } from "./Avatar";
import { EmojiText } from "./EmojiText";
import { CommunicationActions } from "./CommunicationActions";
import {
  FileText,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "../css/ProfileModal.module.css";
import { userService } from "../services/user";
import type { UserDetailInfo } from "../services/user";
import type { ApiResponse } from "../types/api";
import { handleAndShowError } from '../lib/globalErrorHandler'
import { useMomentStore, MomentType } from '../store/moment'
import { useUserStore } from '../store/user'

interface ProfileModalProps {
  userId: string;
  isVisible: boolean;
  onClose: () => void;
  triggerElement?: HTMLElement | null;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  userId,
  isVisible,
  onClose,
  triggerElement,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const lastRequestedUserIdRef = useRef<string | null>(null);
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetailInfo | undefined>(undefined);
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const { navigateToMomentPage } = useMomentStore();
  const { currentUser } = useUserStore();
  
  // 智能判断是否显示通信按钮：只有当查看的不是当前用户时才显示
  const shouldShowActions = currentUser?.id !== userId;

  // 获取用户详细信息
  useEffect(() => {
    if (isVisible && userId) {
      // 如果是重复请求相同的用户ID，避免重复
      if (lastRequestedUserIdRef.current === userId && user) {
        console.log("用户详情已存在，跳过重复请求，用户ID:", userId);
        setShouldShowModal(true);
        return;
      }

      lastRequestedUserIdRef.current = userId;
      setShouldShowModal(false);

      userService
        .getUserDetail(userId)
        .then((response: ApiResponse<UserDetailInfo>) => {
          if (response.success && response.data) {
            setUser(response.data);
            setShouldShowModal(true); // 数据加载成功后才显示弹框
          } else {
            handleAndShowError(new Error(response.msg || "获取用户信息失败"));
            setShouldShowModal(false); // 加载失败时不显示弹框
          }
        })
        .catch((err) => {
          console.error("获取用户详细信息失败:", err);
          handleAndShowError(err);
          setShouldShowModal(false); // 加载失败时不显示弹框
        });
    } else if (!isVisible) {
      // 弹框关闭时重置状态
      setUser(undefined);
      setShouldShowModal(false);
      lastRequestedUserIdRef.current = null;
    }
  }, [isVisible, userId, user]);

  // 跳转到用户动态页面
  const handleNavigateToUserMoments = () => {
    navigateToMomentPage(MomentType.USER, navigate, user)
    onClose();
  };

  // 计算弹框位置
  const getModalPosition = () => {
    if (!triggerElement) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        position: "fixed" as const,
        zIndex: 99999,
      };
    }

    const rect = triggerElement.getBoundingClientRect();
    const modalWidth = 320;
    const modalHeight = shouldShowActions ? 380 : 320; 

    // 弹框默认出现在触发元素右侧，垂直居中对齐
    let top = rect.top + rect.height / 2 - modalHeight / 2;
    let left = rect.right + 8;

    // 检查右侧空间是否足够
    if (left + modalWidth > window.innerWidth - 10) {
      // 右侧空间不足，放在左侧
      left = rect.left - modalWidth - 8;
    }

    // 如果左侧也不够，强制调整到能容纳的位置
    if (left < 10) {
      left = 10;
    }

    // 垂直位置调整，确保不超出屏幕
    if (top < 10) {
      top = 10;
    } else if (top + modalHeight > window.innerHeight - 10) {
      top = window.innerHeight - modalHeight - 10;
    }

    return {
      top: `${Math.round(top)}px`,
      left: `${Math.round(left)}px`,
      position: "fixed" as const,
      zIndex: 99999,
    };
  };

  // ESC键关闭弹框
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleEscapeKey);
      return () => document.removeEventListener("keydown", handleEscapeKey);
    }
  }, [isVisible, onClose]);

  // 格式化动态内容
  const formatMomentContent = (moment: UserDetailInfo["lastMoment"]) => {
    if (!moment) return null;

    const hasText =
      moment.text && moment.text !== null && moment.text.trim().length > 0;
    const hasMedia = moment.medias && moment.medias.length > 0;

    if (hasMedia) {
      return (
        <div className={styles.momentImages}>
          {moment.medias!.slice(0, 3).map((imageUrl, index) => (
            <img
              key={index}
              src={imageUrl}
              alt={`动态图片 ${index + 1}`}
              className={styles.momentImage}
            />
          ))}
          {moment.medias!.length > 3 && (
            <div className={styles.moreImages}>
              +{moment.medias!.length - 3}
            </div>
          )}
        </div>
      );
    } else if (hasText) {
      return <EmojiText text={moment.text!} size="0.9em" />;
    }

    return null;
  };

  if (!isVisible || !shouldShowModal) return null;

  const modalPosition = getModalPosition();

  const modalContent = (
    <>
      {/* 透明背景，用于点击外部关闭 */}
      <div className={styles.overlay} onClick={onClose} />
      <div
        ref={modalRef}
        className={styles.modal}
        style={modalPosition}
        onClick={(e) => e.stopPropagation()}
      >
        {user && (
          <>
            {/* 头像和基本信息区域 */}
            <div className={styles.basicInfo}>
              <div className={styles.avatarSection}>
                <Avatar
                  size={70}
                  userId={user.id}
                  avatarUrl={user.avatar}
                  className={styles.largeAvatar}
                />
              </div>

              <div className={styles.userInfo}>
                <h3 className={styles.nickname}>
                  <EmojiText text={user.nickName || "未设置昵称"} size="1em" />
                  <span className={styles.genderIcon}>🧑</span>
                </h3>
                <div className={styles.account}>账号：{user.openId}</div>
                <div className={styles.region}>地区：未知</div>
              </div>
            </div>

            {/* 个性签名 */}
            <div className={styles.signature}>
              <span className={styles.signatureLabel}>个性签名</span>
              <span className={styles.signatureContent}>
                <EmojiText text={user.individualSignature || "无"} size="1em" />
              </span>
            </div>

            {/* 最新动态按钮 */}
            <button
              className={styles.latestMomentButton}
              onClick={handleNavigateToUserMoments}
            >
              <div className={styles.momentLabel}>最新动态</div>
              <div className={styles.momentContent}>
                {user.lastMoment ? (
                  formatMomentContent(user.lastMoment)
                ) : (
                  <div className={styles.noMoment}>
                    <FileText size={16} />
                    <span>暂无动态</span>
                  </div>
                )}
              </div>
              <ChevronRight size={16} className={styles.chevronIcon} />
            </button>

            {/* 操作按钮（仅非当前用户显示） */}
            {shouldShowActions && user && (
              <div className={styles.actionButtons}>
                <CommunicationActions
                  userId={user.id}
                  userName={user.nickName || "未设置昵称"}
                  variant="modal"
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};
