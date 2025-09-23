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
import { useViewportHeight } from "./hooks/useViewportHeight";

function MilkyWayApp() {
  const { fetchUserInfo, currentUser } = useUserStore();
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // 初始化动态viewport高度支持
  useViewportHeight();

  // 用户认证后先获取用户信息，再根据用户信息变化触发WebSocket连接
  useEffect(() => {
    if (isAuthenticated) {
      // 先获取用户信息（同时验证token）
      fetchUserInfo(true).catch((error) => {
        console.error("[MilkyWayApp] 获取用户信息失败:", error);
        // 用户信息获取失败可能是认证问题，已被http.ts处理
      });
    } else {
      // 用户未认证时确保断开WebSocket连接
      useConnectionManagerStore.getState().destroy();
    }
  }, [isAuthenticated, fetchUserInfo]);

  // 监听用户信息变化，触发WebSocket连接初始化
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      // 当有用户信息时，初始化WebSocket连接
      useConnectionManagerStore
        .getState()
        .initializeApp()
        .catch((error) => {
          console.error("[MilkyWayApp] 初始化聊天应用失败:", error);
        });
    }
  }, [isAuthenticated, currentUser]);

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
          <Route path="/moments" element={<Navigate to="/main/moments/friend" replace />} />
          <Route path="/moments/friend" element={<MomentsPage />} />
          <Route path="/moments/mine" element={<MomentsPage />} />
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
