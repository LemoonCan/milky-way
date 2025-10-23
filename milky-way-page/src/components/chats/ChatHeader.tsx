import React, { useCallback, useEffect, useRef, useState } from "react";
import { Avatar } from "../Avatar";
import { ChevronLeft } from "lucide-react";
import { EmojiText } from "../EmojiText";
import { GroupChatInfo } from "./GroupChatInfo";
import { useIsMobile } from "../../hooks/useIsMobile";
import type { ChatInfoDTO } from "../../services/chat";
import styles from "../../css/chats/ChatHeader.module.css";

interface ChatHeaderProps {
  chat: ChatInfoDTO;
  onBack?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ chat, onBack }) => {
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [hasBlockingModal, setHasBlockingModal] = useState(false);

  const moreActionsRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const isGroupChat = chat.chatType === "GROUP";

  const handleMoreActionsClick = () => {
    setShowMoreActions((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        moreActionsRef.current &&
        !moreActionsRef.current.contains(event.target as Node)
      ) {
        if (hasBlockingModal) return;
        setShowMoreActions(false);
      }
    };

    if (showMoreActions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMoreActions, hasBlockingModal]);

  const handleModalStateChange = useCallback((active: boolean) => {
    setHasBlockingModal(active);
  }, []);

  const handleRequestClose = useCallback(() => {
    setShowMoreActions(false);
  }, []);

  return (
    <div className={styles.chatHeader}>
      <div className={styles.chatHeaderUser}>
        {isMobile && onBack && (
          <button className={styles.backButton} onClick={onBack}>
            <ChevronLeft size={20} />
          </button>
        )}

        <Avatar
          size={40}
          userId={chat.chatType === "SINGLE" ? chat.friendId : chat.id}
          avatarUrl={chat.avatar}
          style={{
            boxShadow: "var(--milky-shadow)",
          }}
        />
        <div className={styles.chatHeaderInfo}>
          <h2 className={styles.chatHeaderName}>
            <EmojiText text={chat.title} size="1em" />
            {chat.chatType === "SINGLE" && (
              <span className={styles.chatHeaderStatus}>
                ({chat.online ? "在线" : "离线"})
              </span>
            )}
          </h2>
        </div>
      </div>

      {isGroupChat && (
        <div className={styles.chatHeaderActions} ref={moreActionsRef}>
          <div className={styles.chatHeaderBtn} onClick={handleMoreActionsClick}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--milky-text-light)"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </div>

          {showMoreActions && (
            <GroupChatInfo
              chatId={chat.id}
              chatTitle={chat.title}
              adminUserId={chat.adminUserId}
              isOpen={showMoreActions}
              onRequestClose={handleRequestClose}
              onModalStateChange={handleModalStateChange}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
