import { useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { SidebarNav } from "./components/SidebarNav";
import { ChatPage } from "./components/chats/ChatPage";
import { SettingsPage } from "./components/settings/SettingsPage";
import { FriendPage } from "./components/friends/FriendPage";
import { MomentsPage } from "./components/moments/MomentsPage";
import { MomentDetailPage } from "./components/moments/MomentDetailPage";

import { useUserStore } from "./store/user";
import { useAuthStore } from "./store/auth";
import { useConnectionManagerStore } from "./store/connectionManager";
import { ConnectionStatus } from "./services/websocket";

function MilkyWayApp() {
  const { fetchUserInfo } = useUserStore();
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { connectionStatus } = useConnectionManagerStore();

  // 应用启动时获取用户信息 - 只执行一次
  useEffect(() => {
    if (connectionStatus === ConnectionStatus.CONNECTED) {
      fetchUserInfo(true).catch((error) => {
        console.warn("获取用户信息失败:", error);
        // 用户信息获取失败不影响应用正常使用
      });
    }
  }, [connectionStatus, fetchUserInfo]);

  // 用户登录后初始化WebSocket连接 - 改进逻辑
  useEffect(() => {
    if (isAuthenticated) {
      console.log(
        "[MilkyWayApp] 用户已认证，初始化聊天服务，当前连接状态:",
        useConnectionManagerStore.getState().isConnected()
      );

      // 直接调用connectionManager的聊天应用初始化方法
      useConnectionManagerStore
        .getState()
        .initializeApp()
        .catch((error) => {
          console.error("[MilkyWayApp] 初始化聊天应用失败:", error);
        });
    } else {
      // 用户未认证时确保断开WebSocket连接
      console.log("[MilkyWayApp] 用户未认证，断开WebSocket连接");
      useConnectionManagerStore.getState().destroy();
    }
  }, [isAuthenticated]); // 移除isConnected依赖，避免重复初始化

  // 根据当前路径确定激活的标签
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes("/messages")) return "messages";
    if (path.includes("/friends")) return "friends";
    if (path.includes("/moments")) return "moments";
    if (path.includes("/settings")) return "settings";
    return "messages";
  };

  const handleTabChange = (tab: string) => {
    navigate(`/main/${tab}`);
  };

  return (
    <div className="milky-container">
      {/* 左侧导航栏 */}
      <SidebarNav activeTab={getActiveTab()} onTabChange={handleTabChange} />

      {/* 主要内容区域 - 使用路由 */}
      <Routes>
        <Route path="/" element={<Navigate to="/main/messages" replace />} />
        <Route path="/messages" element={<ChatPage />} />
        <Route path="/friends" element={<FriendPage />} />
        <Route path="/moments" element={<MomentsPage />} />
        <Route path="/moments/user/:userId" element={<MomentsPage />} />
        <Route
          path="/moments/detail/:momentId"
          element={<MomentDetailPage />}
        />
        <Route path="/settings" element={<SettingsPage />} />

        <Route path="*" element={<Navigate to="/main/messages" replace />} />
      </Routes>
    </div>
  );
}

export default MilkyWayApp;
