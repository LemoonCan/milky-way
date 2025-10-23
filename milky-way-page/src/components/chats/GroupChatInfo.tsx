import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Users, Plus, Minus } from "lucide-react";
import { Avatar } from "../Avatar";
import { EmojiText } from "../EmojiText";
import { ConfirmDialog } from "../ui/confirm-dialog";
import { AddGroupMemberDialog } from "./AddGroupMemberDialog";
import { chatService } from "../../services/chat";
import { useChatStore } from "@/store/chat";
import { useUserStore } from "@/store/user";
import type { SimpleUserDTO } from "../../services/user";
import styles from "../../css/chats/ChatHeader.module.css";

interface GroupChatInfoProps {
  chatId: string;
  chatTitle: string;
  adminUserId?: string;
  isOpen: boolean;
  onRequestClose: () => void;
  onModalStateChange?: (active: boolean) => void;
}

type PendingGroupAction = "dissolve" | "leave" | null;

export const GroupChatInfo: React.FC<GroupChatInfoProps> = ({
  chatId,
  chatTitle,
  adminUserId,
  isOpen,
  onRequestClose,
  onModalStateChange,
}) => {
  const membersContainerRef = useRef<HTMLDivElement>(null);

  const { removeChat } = useChatStore();
  const { currentUser } = useUserStore();

  const currentUserId = currentUser?.id;

  const [members, setMembers] = useState<SimpleUserDTO[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersLoaded, setMembersLoaded] = useState(false);
  const [membersHasNext, setMembersHasNext] = useState(false);
  const [memberCursor, setMemberCursor] = useState<string | undefined>();

  const [isRemoveMode, setIsRemoveMode] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<SimpleUserDTO | null>(
    null
  );
  const [isRemovingMember, setIsRemovingMember] = useState(false);

  const [pendingGroupAction, setPendingGroupAction] =
    useState<PendingGroupAction>(null);
  const [isProcessingGroupAction, setIsProcessingGroupAction] =
    useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const isGroupAdmin = useMemo(() => {
    if (!adminUserId || !currentUserId) return false;
    return adminUserId === currentUserId;
  }, [adminUserId, currentUserId]);

  const memberCountLabel = useMemo(() => {
    if (members.length > 0) return members.length.toString();
    if (membersLoading && !membersLoaded) return "...";
    return "0";
  }, [members.length, membersLoading, membersLoaded]);

  const loadMembers = useCallback(
    async (reset = false) => {
      if (!isOpen) return;
      if (!reset && !membersHasNext) return;
      if (!reset && !memberCursor) {
        setMembersHasNext(false);
        return;
      }

      setMembersLoading(true);
      try {
        const response = await chatService.getChatMembers(chatId, {
          pageSize: 20,
          ...(reset
            ? {}
            : memberCursor
            ? {
                lastId: memberCursor,
              }
            : {}),
        });

        setMembers((prev) => {
          const incoming = response?.items ?? [];
          if (reset) {
            return incoming;
          }

          const merged = new Map<string, SimpleUserDTO>();
          prev.forEach((item) => merged.set(item.id, item));
          incoming.forEach((item) => merged.set(item.id, item));
          return Array.from(merged.values());
        });

        setMembersHasNext(Boolean(response?.hasNext));
        setMemberCursor(response?.lastId ?? undefined);
        setMembersLoaded(true);
      } catch {
        setMembersLoaded(true);
      } finally {
        setMembersLoading(false);
      }
    },
    [chatId, isOpen, memberCursor, membersHasNext]
  );

  useEffect(() => {
    setMembers([]);
    setMembersLoaded(false);
    setMembersHasNext(false);
    setMemberCursor(undefined);
    setIsRemoveMode(false);
    setMemberToRemove(null);
    setPendingGroupAction(null);
    setIsAddDialogOpen(false);
  }, [chatId]);

  useEffect(() => {
    if (isOpen && !membersLoaded && !membersLoading) {
      void loadMembers(true);
    }
  }, [isOpen, loadMembers, membersLoaded, membersLoading]);

  useEffect(() => {
    if (!isOpen) return;
    const container = membersContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (!membersHasNext || membersLoading) return;
      const { scrollTop, clientHeight, scrollHeight } = container;
      if (scrollHeight - (scrollTop + clientHeight) < 96) {
        void loadMembers(false);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen, membersHasNext, membersLoading, loadMembers]);

  useEffect(() => {
    if (!onModalStateChange) return;
    const active =
      isAddDialogOpen || Boolean(memberToRemove) || Boolean(pendingGroupAction);
    onModalStateChange(active);
    return () => {
      onModalStateChange(false);
    };
  }, [isAddDialogOpen, memberToRemove, pendingGroupAction, onModalStateChange]);

  const handleMembersContainerClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!isRemoveMode) return;
      const target = event.target as HTMLElement;
      if (target.closest(`.${styles.memberItemRemovable}`)) return;
      setIsRemoveMode(false);
    },
    [isRemoveMode]
  );

  const canRemoveMember = useCallback(
    (member: SimpleUserDTO) => {
      if (!isGroupAdmin) return false;
      if (!member?.id) return false;
      if (member.id === adminUserId) return false;
      if (member.id === currentUserId) return false;
      return true;
    },
    [adminUserId, currentUserId, isGroupAdmin]
  );

  const handleMemberClick = useCallback(
    (member: SimpleUserDTO) => {
      if (!isRemoveMode) return;
      if (!canRemoveMember(member)) return;
      setMemberToRemove(member);
    },
    [canRemoveMember, isRemoveMode]
  );

  const handleAddMembersClick = useCallback(() => {
    setIsRemoveMode(false);
    setIsAddDialogOpen(true);
  }, []);

  const handleMembersAdded = useCallback((newMembers: SimpleUserDTO[]) => {
    setIsAddDialogOpen(false);
    if (!newMembers || newMembers.length === 0) return;
    setMembers((prev) => {
      const merged = new Map<string, SimpleUserDTO>();
      prev.forEach((item) => merged.set(item.id, item));
      newMembers.forEach((item) => {
        if (item?.id) {
          merged.set(item.id, item);
        }
      });
      return Array.from(merged.values());
    });
  }, []);

  const handleConfirmRemoveMember = useCallback(async () => {
    if (!memberToRemove?.id) return;
    setIsRemovingMember(true);
    try {
      await chatService.removeChatMember(chatId, memberToRemove.id);
      setMembers((prev) => prev.filter((item) => item.id !== memberToRemove.id));
      setMemberToRemove(null);
    } finally {
      setIsRemovingMember(false);
    }
  }, [chatId, memberToRemove]);

  const handleCancelRemoveMember = useCallback(() => {
    setMemberToRemove(null);
  }, []);

  const handleToggleRemoveMode = useCallback(() => {
    if (!isGroupAdmin) return;
    setIsRemoveMode((prev) => !prev);
  }, [isGroupAdmin]);

  const handleGroupActionClick = useCallback(() => {
    setPendingGroupAction(isGroupAdmin ? "dissolve" : "leave");
  }, [isGroupAdmin]);


  const handleConfirmGroupAction = useCallback(async () => {
    if (!pendingGroupAction) return;
    setIsProcessingGroupAction(true);
    try {
      if (pendingGroupAction === "dissolve") {
        await chatService.deleteChat(chatId);
        removeChat(chatId);
      } else {
        if (!currentUserId) {
          throw new Error("当前用户未知");
        }
        await chatService.removeChatMember(chatId, currentUserId);
        removeChat(chatId);
      }
      onRequestClose();
      setIsRemoveMode(false);
    } finally {
      setIsProcessingGroupAction(false);
      setPendingGroupAction(null);
    }
  }, [chatId, currentUserId, onRequestClose, pendingGroupAction, removeChat]);

  const handleCancelGroupAction = useCallback(() => {
    setPendingGroupAction(null);
  }, []);

  const membersContent = useMemo(() => {
    if (membersLoading && members.length === 0) {
      return null;
    }

    if (members.length === 0) {
      if (membersLoading) {
        return null;
      }
      return <div className={styles.memberEmpty}>暂无成员信息</div>;
    }

    return (
      <>
        <div
          className={styles.memberGrid}
          onClick={handleMembersContainerClick}
        >
          {members.map((member) => {
            const removable = canRemoveMember(member);
            const memberClassName = [
              styles.memberItem,
              isRemoveMode && isGroupAdmin ? styles.memberItemRemovable : "",
              isRemoveMode && !removable ? styles.memberItemProtected : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                key={member.id}
                type="button"
                className={memberClassName}
                onClick={() => handleMemberClick(member)}
              >
                <div className={styles.memberAvatarWrapper}>
                  <Avatar
                    size={44}
                    userId={member.id}
                    avatarUrl={member.avatar}
                    style={{
                      boxShadow: "var(--milky-shadow)",
                    }}
                  />
                  {isRemoveMode && isGroupAdmin && removable && (
                    <span className={styles.memberRemoveBadge}>-</span>
                  )}
                </div>
                <span className={styles.memberName} title={member.nickName}>
                  {member.nickName}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            className={`${styles.memberItem} ${styles.memberActionItem}`}
            onClick={handleAddMembersClick}
          >
            <div className={styles.memberActionIcon}>
              <Plus size={18} />
            </div>
            <span className={styles.memberName}>添加成员</span>
          </button>
          {isGroupAdmin && (
            <button
              type="button"
              className={`${styles.memberItem} ${styles.memberActionItem}`}
              onClick={handleToggleRemoveMode}
            >
              <div className={styles.memberActionIcon}>
                <Minus size={18} />
              </div>
              <span className={styles.memberName}>
                {isRemoveMode ? "完成" : "移除成员"}
              </span>
            </button>
          )}
        </div>
      </>
    );
  }, [
    canRemoveMember,
    handleAddMembersClick,
    handleMemberClick,
    handleMembersContainerClick,
    handleToggleRemoveMode,
    isGroupAdmin,
    isRemoveMode,
    members,
    membersLoading,
  ]);

  const groupActionLabel = isGroupAdmin ? "解散群聊" : "退出群聊";

  return (
    <>
      <div className={styles.moreActionsMenu}>
        <div className={styles.groupMenuHeader}>
          <div className={styles.groupMenuTitle}>
            <Users size={16} />
            <span>群成员</span>
            <span className={styles.groupMenuCount}>{memberCountLabel}</span>
          </div>
        </div>

        <div className={styles.groupMenuContent} ref={membersContainerRef}>
          {membersContent}
        </div>

        <div className={styles.groupMenuSection}>
          <div className={styles.sectionTitle}>群聊名称</div>
          <div className={styles.groupNameWrapper}>
            <EmojiText text={chatTitle} size="1em" />
          </div>
        </div>

        <div className={styles.groupMenuFooter}>
          <button
            type="button"
            className={`${styles.groupActionButton} ${styles.dangerAction}`}
            onClick={handleGroupActionClick}
          >
            {groupActionLabel}
          </button>
        </div>
      </div>

      <AddGroupMemberDialog
        open={isAddDialogOpen}
        chatId={chatId}
        existingMemberIds={members.map((member) => member.id)}
        onClose={() => setIsAddDialogOpen(false)}
        onMembersAdded={handleMembersAdded}
      />

      <ConfirmDialog
        isOpen={Boolean(memberToRemove)}
        title="移除成员"
        message={
          memberToRemove
            ? `确定要将 ${memberToRemove.nickName} 移出群聊吗？`
            : ""
        }
        confirmText={isRemovingMember ? "移除中..." : "移除"}
        cancelText="取消"
        onConfirm={handleConfirmRemoveMember}
        onCancel={handleCancelRemoveMember}
      />

      <ConfirmDialog
        isOpen={Boolean(pendingGroupAction)}
        title={groupActionLabel}
        message={
          pendingGroupAction === "dissolve"
            ? `确定要解散群聊 "${chatTitle}" 吗？解散后所有成员将无法继续发送消息。`
            : `确定要退出群聊 "${chatTitle}" 吗？退出后将不再接收此群消息。`
        }
        confirmText={isProcessingGroupAction ? "处理中..." : "确定"}
        cancelText="取消"
        onConfirm={handleConfirmGroupAction}
        onCancel={handleCancelGroupAction}
      />
    </>
  );
};

export default GroupChatInfo;
