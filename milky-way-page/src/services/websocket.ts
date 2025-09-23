import { Client, StompConfig, ActivationState } from "@stomp/stompjs";
import type { IMessage, StompSubscription } from "@stomp/stompjs";
import { tokenManager } from "../lib/http";
import type { MessageNotifyDTO } from "../types/api";
import type { MessageDTO } from "./chat";
import EnvConfig from "../lib/env";

export interface WebSocketMessage {
  chatId: string;
  messageType: "SYSTEM" | "TEXT" | "IMAGE" | "FILE" | "VIDEO";
  content: string;
  clientMsgId?: string; // 客户端消息ID，用于回执匹配
  senderUserId?: string;
  timestamp?: string;
}

export interface NewMessageHandler {
  (message: MessageDTO): void;
}

// 消息回执处理器接口
export interface MessageReceiptHandler {
  (receipt: MessageReceipt): void;
}

// 通知处理器接口
export interface NotificationHandler {
  (notification: MessageNotifyDTO<unknown>): void;
}

// 消息回执类型
export interface MessageReceipt {
  success: boolean;
  code: string;
  msg: string;
  data: MessageDTO;
}

// 连接状态枚举
export enum Status {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  FAILED = "failed",
}

// 状态变更回调接口
export interface StatusChangeHandler {
  (status: Status, error?: string): void;
}

export class WebSocketClient {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private newMessageHandlers: Set<NewMessageHandler> = new Set();
  private receiptHandlers: Set<MessageReceiptHandler> = new Set();
  private notificationHandlers: Set<NotificationHandler> = new Set();

  // 移除重试相关状态，只保留状态回调
  private statusChangeHandler: StatusChangeHandler | null = null;

  constructor() {}

  /**
   * 设置状态变更回调
   */
  public setStatusChangeHandler(handler: StatusChangeHandler) {
    this.statusChangeHandler = handler;
  }

  /**
   * 通知状态变更
   */
  private notifyStatusChange(status: Status, error?: string) {
    if (this.statusChangeHandler) {
      this.statusChangeHandler(status, error);
    }
  }

  /**
   * 创建STOMP客户端
   */
  private createClient(): Client {
    const token = tokenManager.getToken();
    if (!token) {
      throw new Error("认证失败，无法建立WebSocket连接");
    }

    const config: StompConfig = {
      brokerURL: `${EnvConfig.WS_URL}?authToken=${encodeURIComponent(token)}`,
      connectHeaders: {
        "accept-version": "1.2",
        host: EnvConfig.WS_HOST,
      },
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      reconnectDelay: 0, // 禁用自动重连，我们手动控制
      debug: () => {},
      onConnect: () => {
        this.onConnected();
      },
      onDisconnect: () => {
        this.onDisconnected("连接意外断开");
      },
      onWebSocketError: () => {
        this.onConnectionError("WebSocket错误");
      },
      onStompError: () => {
        this.onConnectionError("STOMP协议错误");
      },
      onWebSocketClose: () => {
        this.onDisconnected("WebSocket连接关闭");
      },

      onChangeState: (state) => {
        if (state === ActivationState.INACTIVE) {
          this.onDisconnected("状态变为 INACTIVE");
        }
      },
    };

    return new Client(config);
  }

  /**
   * 连接成功处理
   */
  private onConnected() {
    this.notifyStatusChange(Status.CONNECTED);

    // 订阅消息
    this.subscribeToPersonalMessages();
    this.subscribeToMessageReceipts();
    this.subscribeToNotifications();
    this.subscribeToGroupChats();
  }

  /**
   * 连接断开处理
   */
  private onDisconnected(reason: string) {
    // 设置为未连接状态
    this.notifyStatusChange(Status.DISCONNECTED, reason);
  }

  /**
   * 连接错误处理
   */
  private onConnectionError(error: string) {
    this.notifyStatusChange(Status.FAILED, error);
  }

  /**
   * 单次连接尝试（不重试）
   */
  public async connect(): Promise<void> {
    if (this.isConnected()) {
      return;
    }

    this.notifyStatusChange(Status.CONNECTING);

    return new Promise((resolve, reject) => {
      if (this.client) {
        this.client.deactivate();
      }

      this.client = this.createClient();

      // 设置一次性连接结果处理
      const originalOnConnect = this.client.onConnect;
      const originalOnWebSocketError = this.client.onWebSocketError;

      this.client.onConnect = (frame) => {
        originalOnConnect(frame);
        resolve();
      };

      this.client.onWebSocketError = (error) => {
        originalOnWebSocketError(error);
        reject(new Error("WebSocket连接失败"));
      };

      // 激活连接
      this.client.activate();
    });
  }

  /**
   * 断开连接
   */
  public disconnect(): void {
    if (this.client) {
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();
      this.client.deactivate();
    }

    this.notifyStatusChange(Status.DISCONNECTED);
  }

  /**
   * 检查连接状态
   */
  public isConnected(): boolean {
    return this.client?.connected || false;
  }

  /**
   * 获取当前连接信息（简化版）
   */
  public getConnectionInfo() {
    return {
      connected: this.isConnected(),
    };
  }

  /**
   * 订阅个人消息队列
   */
  private subscribeToPersonalMessages() {
    if (!this.client || !this.isConnected()) return;

    const subscriptionId = `personal-messages-${Date.now()}`;

    const subscription = this.client.subscribe(
      "/user/queue/messages",
      (message: IMessage) => {
        const messageData: MessageDTO = JSON.parse(message.body);
        this.handleNewMessage(messageData);
      },
      {
        id: subscriptionId,
        ack: "auto",
      }
    );

    this.subscriptions.set("personal", subscription);
  }

  /**
   * 订阅消息发送回执
   */
  private subscribeToMessageReceipts() {
    if (!this.client || !this.isConnected()) return;

    const subscriptionId = `message-receipts-${Date.now()}`;

    const subscription = this.client.subscribe(
      "/user/queue/receipts",
      (message: IMessage) => {
        const receiptData = JSON.parse(message.body);
        this.handleMessageReceipt(receiptData);
      },
      {
        id: subscriptionId,
        ack: "auto",
      }
    );

    this.subscriptions.set("receipts", subscription);
  }

  /**
   * 订阅通知队列
   */
  private subscribeToNotifications() {
    if (!this.client || !this.isConnected()) return;

    const subscriptionId = `notifications-${Date.now()}`;

    const subscription = this.client.subscribe(
      "/user/queue/notifications",
      (message: IMessage) => {
        const notificationData: MessageNotifyDTO<unknown> = JSON.parse(
          message.body
        );
        this.handleNotification(notificationData);
      },
      {
        id: subscriptionId,
        ack: "auto",
      }
    );

    this.subscriptions.set("notifications", subscription);
  }

  /**
   * 订阅群聊频道
   */
  private async subscribeToGroupChats() {
    // 获取群聊列表
    const response = await fetch(`${EnvConfig.API_BASE_URL}/chats/groupChats`, {
      headers: {
        Authorization: `Bearer ${tokenManager.getToken()}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`获取群聊列表失败: ${response.status}`);
    }

    const result = await response.json();
    if (result.data) {
      const groupChatIds: string[] = result.data;

      groupChatIds.forEach((chatId) => {
        this.subscribeToGroupChat(chatId);
      });
    }
  }

  /**
   * 订阅单个群聊
   */
  public subscribeToGroupChat(chatId: string) {
    if (!this.client || !this.isConnected()) {
      return;
    }

    const subscriptionId = `group-chat-${chatId}-${Date.now()}`;

    const subscription = this.client.subscribe(
      `/topic/groupChat/${chatId}`,
      (message: IMessage) => {
        const messageData: MessageDTO = JSON.parse(message.body);
        this.handleNewMessage(messageData);
      },
      {
        id: subscriptionId,
        ack: "auto",
      }
    );

    this.subscriptions.set(`group-${chatId}`, subscription);
  }

  /**
   * 取消订阅群聊
   */
  public unsubscribeFromGroupChat(chatId: string) {
    const subscriptionKey = `group-${chatId}`;
    const subscription = this.subscriptions.get(subscriptionKey);

    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionKey);
    }
  }

  /**
   * 发送消息
   */
  public sendMessage(message: WebSocketMessage): void {
    if (!this.client || !this.isConnected()) {
      throw new Error("WebSocket未连接");
    }

    this.client.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify(message),
      headers: {
        "content-type": "application/json",
      },
    });
  }

  /**
   * 添加NewMessage处理器
   */
  public addNewMessageHandler(handler: NewMessageHandler): void {
    this.newMessageHandlers.add(handler);
  }

  /**
   * 移除NewMessage处理器
   */
  public removeNewMessageHandler(handler: NewMessageHandler): void {
    this.newMessageHandlers.delete(handler);
  }

  /**
   * 添加回执处理器
   */
  public addReceiptHandler(handler: MessageReceiptHandler): void {
    this.receiptHandlers.add(handler);
  }

  /**
   * 移除回执处理器
   */
  public removeReceiptHandler(handler: MessageReceiptHandler): void {
    this.receiptHandlers.delete(handler);
  }

  /**
   * 添加通知处理器
   */
  public addNotificationHandler(handler: NotificationHandler): void {
    this.notificationHandlers.add(handler);
  }

  /**
   * 移除通知处理器
   */
  public removeNotificationHandler(handler: NotificationHandler): void {
    this.notificationHandlers.delete(handler);
  }

  /**
   * 清理所有处理器
   */
  public clearAllHandlers(): void {
    this.newMessageHandlers.clear();
    this.receiptHandlers.clear();
    this.notificationHandlers.clear();
  }

  /**
   * 处理接收到的NewMessage
   */
  private handleNewMessage(message: MessageDTO): void {
    this.newMessageHandlers.forEach((handler) => {
      handler(message);
    });
  }

  /**
   * 处理接收到的消息回执
   */
  private handleMessageReceipt(receipt: MessageReceipt): void {
    this.receiptHandlers.forEach((handler) => {
      handler(receipt);
    });
  }

  /**
   * 处理接收到的通知
   */
  private handleNotification(notification: MessageNotifyDTO<unknown>): void {
    this.notificationHandlers.forEach((handler) => {
      handler(notification);
    });
  }
}

// 创建全局WebSocket客户端实例
export const webSocketClient = new WebSocketClient();
