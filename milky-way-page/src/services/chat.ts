import http from "../lib/http";
import { webSocketClient, type WebSocketMessage } from "./websocket";
import type { ApiResponse, Slices } from "../types/api";
import type { SimpleUserDTO } from "./user";
import { useConnectionManagerStore } from "../store/connectionManager";

// 添加聊天列表接口的返回类型，对应后端的 ChatInfoDTO
export interface ChatInfoDTO {
  id: string;
  chatType: "SINGLE" | "GROUP";
  title: string;
  avatar: string;
  lastMessageId: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
  friendId?: string; // 好友ID，仅在单聊时有值
  adminUserId?: string; // 群管理员ID，仅在群聊时有值
  memberCount?: number; // 群成员数量
}

// 消息元数据类型
export interface MessageMeta {
  type: "SYSTEM" | "TEXT" | "IMAGE" | "FILE" | "VIDEO";
  content?: string | null;
  media?: string | null;
  videoUrl?: string | null; // 真实视频URL，用于视频消息类型
}

// MessageMeta URL处理工具类
export class MessageMetaHelper {
  /**
   * 根据媒体类型设置真实URL
   * @param meta MessageMeta对象
   * @param realUrl 真实URL
   */
  static setRealUrl(meta: MessageMeta, realUrl: string): void {
    if (meta.type === "FILE" || meta.type === "IMAGE") {
      meta.media = realUrl;
    } else if (meta.type === "VIDEO") {
      meta.videoUrl = realUrl;
    }
  }

  /**
   * 根据媒体类型获取真实URL
   * @param meta MessageMeta对象
   * @returns 真实URL或null
   */
  static getRealUrl(meta: MessageMeta): string | null | undefined {
    if (meta.type === "FILE" || meta.type === "IMAGE") {
      return meta.media;
    } else if (meta.type === "VIDEO") {
      return meta.videoUrl;
    }
    return null;
  }

  static getMessageTypeFromFile = (file: File): "IMAGE" | "VIDEO" | "FILE" => {
    if (file.type.startsWith("image/")) return "IMAGE";
    if (file.type.startsWith("video/")) return "VIDEO";
    return "FILE";
  };
}

// 添加消息DTO类型，对应后端的 MessageDTO
export interface MessageDTO {
  id: string;
  clientMsgId?: string; // 客户端消息ID，用于回执匹配
  chatId: string;
  sender: SimpleUserDTO;
  meta: MessageMeta;
  sentTime: string;
  read?: boolean;
  readTime?: string;
}

// 文件数据接口
export interface FileData {
  originalFile?: File;
}

// 客户端消息类型，包含UI状态字段
export interface ClientMessageDTO extends MessageDTO {
  sendStatus?: "sending" | "sent" | "failed";
  fileData?: FileData;
}

// 聊天消息查询参数
export interface ChatMessagesQueryParam {
  chatId: string;
  before?: string; // 分页游标，查询在此ID之前的消息
  after?: string; // 分页游标，查询在此ID之后的消息
  pageSize: number;
}

export interface SendMessageRequest {
  chatId: string;
  content: string;
  messageType?: "SYSTEM" | "TEXT" | "IMAGE" | "FILE" | "VIDEO";
  clientMsgId?: string; // 客户端消息ID，用于回执匹配
}

// 添加消息标记已读请求参数接口
export interface MessageReadRequest {
  chatId: string;
  messageId: string;
}

// 创建群聊请求参数
export interface CreateGroupChatRequest {
  chatType: "SINGLE" | "GROUP";
  title: string;
  members: string[];
}

// 聊天DTO返回类型
export interface ChatDTO {
  id: string;
  chatType: "SINGLE" | "GROUP";
  title: string;
  avatar?: string;
  memberCount?: number;
}

export class ChatService {
  /**
   * 获取聊天列表
   * @param lastMessageId 上次查询的最后一个消息ID，用于分页
   * @param pageSize 每页大小，默认20
   */
  async getChatList(
    lastMessageId?: string,
    pageSize?: number
  ): Promise<Slices<ChatInfoDTO>> {
    const params = new URLSearchParams();
    if (lastMessageId) {
      params.append("lastMessageId", lastMessageId);
    }
    if (pageSize) {
      params.append("pageSize", pageSize.toString());
    }

    const url = `/chats${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await http.get<ApiResponse<Slices<ChatInfoDTO>>>(url);

    return response.data.data!;
  }

  /**
   * 获取聊天消息
   * @param param 查询参数
   */
  async getChatMessages(
    param: ChatMessagesQueryParam
  ): Promise<Slices<MessageDTO>> {
    const params = new URLSearchParams();
    if (param.before) {
      params.append("before", param.before);
    }
    if (param.after) {
      params.append("after", param.after);
    }
    params.append("pageSize", param.pageSize.toString());

    const url = `/chats/messages/${param.chatId}?${params.toString()}`;
    const response = await http.get<ApiResponse<Slices<MessageDTO>>>(url);

    return response.data.data!;
  }

  /**
   * 获取群聊列表
   */
  async getGroupChats(): Promise<string[]> {
    const response = await http.get<ApiResponse<string[]>>("/chats/groupChats");
    return response.data.data!;
  }

  /**
   * 获取群聊成员
   */
  async getChatMembers(
    chatId: string,
    options?: { pageSize?: number; lastId?: string }
  ): Promise<Slices<SimpleUserDTO>> {
    const response = await http.get<ApiResponse<Slices<SimpleUserDTO>>>(
      `/chats/members/${chatId}`,
      {
        params: {
          pageSize: options?.pageSize ?? 20,
          ...(options?.lastId ? { lastId: options.lastId } : {}),
        },
      }
    );
    
    return response.data.data!;
  }

  /**
   * 添加群成员
   */
  async addChatMember(chatId: string, userId: string): Promise<void> {
    await http.post<ApiResponse<void>>(
      `/chats/members?chatId=${chatId}&userId=${userId}`
    );
  }

  /**
   * 移除群成员
   */
  async removeChatMember(chatId: string, userId: string): Promise<void> {
    await http.delete<ApiResponse<void>>(
      `/chats/members?chatId=${chatId}&userId=${userId}`
    );
  }

  /**
   * 标记消息为已读
   * @param request 标记已读请求参数
   */
  async markMessagesAsRead(request: MessageReadRequest): Promise<void> {
    await http.patch<ApiResponse<void>>("/chats/read", request);
  }

  /**
   * 发送消息
   */
  async sendMessage(request: SendMessageRequest): Promise<void> {
    if (!webSocketClient.isConnected()) {
      useConnectionManagerStore.getState().initializeApp();
      throw new Error("聊天服务未就绪");
    }

    const message: WebSocketMessage = {
      chatId: request.chatId,
      content: request.content,
      messageType: request.messageType || "TEXT",
      clientMsgId: request.clientMsgId, // 确保传递客户端消息ID
    };

    webSocketClient.sendMessage(message);
  }

  /**
   * 订阅群聊
   */
  subscribeToGroupChat(chatId: string): void {
    webSocketClient.subscribeToGroupChat(chatId);
  }

  /**
   * 取消订阅群聊
   */
  unsubscribeFromGroupChat(chatId: string): void {
    webSocketClient.unsubscribeFromGroupChat(chatId);
  }

  /**
   * 解散聊天室
   * @param chatId 聊天室ID
   */
  async deleteChat(chatId: string): Promise<void> {
    await http.delete<ApiResponse<void>>(`/chats/${chatId}`);

    // 取消订阅该聊天室的消息
    this.unsubscribeFromGroupChat(chatId);
  }

  /**
   * 创建群聊
   */
  async createGroupChat(request: CreateGroupChatRequest): Promise<ChatInfoDTO> {
    const response = await http.post<ApiResponse<ChatInfoDTO>>(
      "/chats",
      request
    );
    return response.data.data!;
  }

  /**
   * 获取好友聊天信息
   * @param friendUserId 好友用户ID
   */
  async getFriendChat(friendUserId: string): Promise<ChatInfoDTO> {
    const response = await http.get<ApiResponse<ChatInfoDTO>>(
      `/chats/friendChat?friendUserId=${friendUserId}`
    );
    return response.data.data!;
  }

  /**
   * 获取AI助手回复
   * @param chatId 聊天ID
   */
  async getAiReply(chatId: string): Promise<string> {
    const url = `/chats/ai/reply/${chatId}`;
    // AI回复可能需要较长时间，设置60秒超时
    const response = await http.get<ApiResponse<string>>(url, {
      timeout: 60000
    });
    return response.data.data!;
  }
}

// 创建全局聊天服务实例
export const chatService = new ChatService();

// 导出默认实例
export default chatService;
