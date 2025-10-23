import React, { useEffect, useMemo, useState } from "react";
import { Search, X, Check, Loader2 } from "lucide-react";
import { Avatar } from "../Avatar";
import { useFriendStore } from "@/store/friend";
import { chatService } from "../../services/chat";
import type { Friend } from "../../services/friend";
import type { SimpleUserDTO } from "../../services/user";
import styles from "../../css/chats/GroupMemberDialog.module.css";

interface AddGroupMemberDialogProps {
  open: boolean;
  chatId: string;
  existingMemberIds: string[];
  onClose: () => void;
  onMembersAdded: (newMembers: SimpleUserDTO[]) => void;
}

export const AddGroupMemberDialog: React.FC<AddGroupMemberDialogProps> = ({
  open,
  chatId,
  existingMemberIds,
  onClose,
  onMembersAdded,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    friends,
    fetchFriends,
    fetchMoreFriends,
    hasNextPage,
    isFriendsLoading,
  } = useFriendStore();

  useEffect(() => {
    if (!open) return;
    void fetchFriends(true);
    setSearchQuery("");
    setSelectedFriends([]);
  }, [open, fetchFriends]);

  const availableFriends = useMemo(() => {
    return friends.filter(
      (entry) => !existingMemberIds.includes(entry.friend.id)
    );
  }, [friends, existingMemberIds]);

  const filteredFriends = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return availableFriends;
    return availableFriends.filter((entry) => {
      const name = entry.friend.nickName.toLowerCase();
      const remark = entry.remark?.toLowerCase() ?? "";
      return name.includes(query) || remark.includes(query);
    });
  }, [availableFriends, searchQuery]);

  const isSelected = (friendId: string) =>
    selectedFriends.some((item) => item.friend.id === friendId);

  const toggleFriendSelection = (friend: Friend) => {
    setSelectedFriends((prev) => {
      if (prev.some((item) => item.friend.id === friend.friend.id)) {
        return prev.filter((item) => item.friend.id !== friend.friend.id);
      }
      return [...prev, friend];
    });
  };

  const handleSubmit = async () => {
    if (selectedFriends.length === 0) return;
    setIsSubmitting(true);
    try {
      const newMembers: SimpleUserDTO[] = [];
      for (const friend of selectedFriends) {
        await chatService.addChatMember(chatId, friend.friend.id);
        newMembers.push(friend.friend);
      }
      onMembersAdded(newMembers);
      setSelectedFriends([]);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.dialog}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>添加群成员</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.searchContainer}>
            <div className={styles.searchInputWrapper}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="搜索好友昵称或备注"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
          </div>

          {selectedFriends.length > 0 && (
            <div className={styles.selectedSection}>
              <div className={styles.selectedLabel}>
                已选择 {selectedFriends.length} 人
              </div>
              <div className={styles.selectedFriends}>
                {selectedFriends.map((entry) => (
                  <div
                    key={entry.friend.id}
                    className={styles.selectedFriend}
                  >
                    <Avatar
                      avatarUrl={entry.friend.avatar}
                      userId={entry.friend.id}
                      size={36}
                    />
                    <div className={styles.selectedFriendName}>
                      {entry.remark || entry.friend.nickName}
                    </div>
                    <button
                      type="button"
                      className={styles.removeFriendButton}
                      onClick={() =>
                        setSelectedFriends((prev) =>
                          prev.filter(
                            (item) => item.friend.id !== entry.friend.id
                          )
                        )
                      }
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.friendsSection}>
            <div className={styles.friendsLabel}>可添加的好友</div>
            <div className={styles.friendsList}>
              {isFriendsLoading && availableFriends.length === 0 ? (
                <div className={styles.emptyState}>
                  <Loader2 className={styles.spinner} />
                  <span>好友列表加载中...</span>
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className={styles.emptyState}>
                  {searchQuery ? "未找到匹配的好友" : "暂无可添加的好友"}
                </div>
              ) : (
                filteredFriends.map((entry) => (
                  <div
                    key={entry.friend.id}
                    className={`${styles.friendItem} ${
                      isSelected(entry.friend.id) ? styles.selected : ""
                    }`}
                    onClick={() => toggleFriendSelection(entry)}
                  >
                    <Avatar
                      avatarUrl={entry.friend.avatar}
                      userId={entry.friend.id}
                      size={44}
                    />
                    <div className={styles.friendInfo}>
                      <div className={styles.friendName}>
                        {entry.remark || entry.friend.nickName}
                      </div>
                      <div className={styles.friendSignature}>
                        {entry.friend.nickName}
                      </div>
                    </div>
                    {isSelected(entry.friend.id) && (
                      <Check size={18} className={styles.checkIcon} />
                    )}
                  </div>
                ))
              )}
            </div>

            {hasNextPage && (
              <button
                type="button"
                className={styles.loadMoreButton}
                disabled={isFriendsLoading}
                onClick={() => fetchMoreFriends()}
              >
                {isFriendsLoading ? "加载中..." : "加载更多好友"}
              </button>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.cancelButton}
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            取消
          </button>
          <button
            className={styles.confirmButton}
            type="button"
            onClick={handleSubmit}
            disabled={selectedFriends.length === 0 || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className={styles.buttonSpinner} size={16} />
                添加中...
              </>
            ) : (
              "添加成员"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddGroupMemberDialog;
