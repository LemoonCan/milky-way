import React, { useState, useEffect } from "react";
import { ChatListItem } from "./ChatListItem";
import { TitleBar } from "../TitleBar";
import { CreateGroupChatDialog } from "./CreateGroupChatDialog";
import { Search, SmilePlus } from "lucide-react";
import { useChatStore } from "@/store/chat";
import type { ChatInfoDTO } from "../../services/chat";
import styles from "../../css/chats/ChatList.module.css";
import { useUserStore } from "@/store/user";

export const ChatList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
  const {
    currentChatId,
    chats,
    isLoading,
    hasMoreChats,
    pendingFriendUserId,
    loadChatList,
    loadMoreChats,
    setCurrentChat,
    ensureFriendChatAndNavigate,
    setPendingFriendUserId,
  } = useChatStore();

  const { currentUser } = useUserStore();

  // 组件挂载时加载聊天列表
  useEffect(() => {
    // 延迟执行，等待WebSocket连接状态稳定
    if (currentUser) {
      loadChatList();
    }
  }, [currentUser, loadChatList]);

  // 监听聊天列表加载状态和待处理的好友用户ID
  useEffect(() => {
    const processPendingFriendChat = async () => {
      try {
        console.log(
          "[ChatList] 聊天列表加载完成，开始处理好友聊天:",
          pendingFriendUserId
        );
        if(!pendingFriendUserId){
          return;
        }

        // 调用 store 方法获取好友聊天信息并处理聊天列表（包含置顶逻辑）
        const chatId = await ensureFriendChatAndNavigate(pendingFriendUserId);

        // 设置当前聊天
        await setCurrentChat(chatId);

        // 清除待处理状态
        setPendingFriendUserId(null);
      } catch  {
        // 清除待处理状态，即使失败也要清除，避免无限重试
        setPendingFriendUserId(null);
      }
    };

    if (!isLoading && pendingFriendUserId) {
      processPendingFriendChat();
    }
  }, [pendingFriendUserId, isLoading]);

  const filteredChats = chats.filter(
    (chat: ChatInfoDTO) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 处理滚动加载更多
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // 当滚动到底部时加载更多
    if (
      scrollHeight - scrollTop === clientHeight &&
      hasMoreChats &&
      !isLoading
    ) {
      loadMoreChats();
    }
  };

  return (
    <div className={styles.chatList}>
      {/* 头部区域 */}
      <TitleBar title="消息" />

      {/* 搜索框 */}
      <div className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <div className={styles.searchInputWrapper}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="搜索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button
            className={styles.addGroupButton}
            onClick={() => setShowCreateGroupDialog(true)}
            title="发起群聊"
          >
            <SmilePlus size={20} />
          </button>
        </div>
      </div>

      {/* 聊天列表 */}
      <div
        className={`${styles.chatListContent} ${styles.listContainer}`}
        onScroll={handleScroll}
      >
        {filteredChats.length === 0 ? (
          <div className={styles.emptyState}>
            {searchQuery ? "未找到匹配的聊天" : "暂无聊天记录"}
          </div>
        ) : (
          <div>
            {filteredChats.map((chat: ChatInfoDTO) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === currentChatId}
                onClick={() => setCurrentChat(chat.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 创建群聊对话框 */}
      <CreateGroupChatDialog
        open={showCreateGroupDialog}
        onClose={() => setShowCreateGroupDialog(false)}
      />
    </div>
  );
};
