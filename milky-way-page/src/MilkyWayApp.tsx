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
  const { fetchUserInfo } = useUserStore();
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  // 初始化动态viewport高度支持
  useViewportHeight();

  // 用户登录后的初始化流程 - 先获取用户信息，再初始化WebSocket
  useEffect(() => {
    if (isAuthenticated) {
      console.log("[MilkyWayApp] 用户已认证，开始初始化流程");
      
      // 第一步：获取用户信息
      fetchUserInfo(true)
        .then(() => {
          console.log("[MilkyWayApp] 用户信息获取成功，开始初始化WebSocket连接");
          
          // 第二步：用户信息获取成功后，初始化WebSocket连接
          return useConnectionManagerStore.getState().initializeApp();
        })
        .then(() => {
          console.log("[MilkyWayApp] WebSocket连接初始化成功");
        })
        .catch((error) => {
          console.error("[MilkyWayApp] 初始化流程失败:", error);
          // 即使获取用户信息失败，也尝试初始化WebSocket（降级处理）
          if (error.message?.includes('用户信息')) {
            console.log("[MilkyWayApp] 用户信息获取失败，但仍尝试初始化WebSocket");
            useConnectionManagerStore
              .getState()
              .initializeApp()
              .catch((wsError) => {
                console.error("[MilkyWayApp] WebSocket初始化也失败:", wsError);
              });
          }
        });
    } else {
      // 用户未认证时确保断开WebSocket连接
      console.log("[MilkyWayApp] 用户未认证，断开WebSocket连接");
      useConnectionManagerStore.getState().destroy();
    }
  }, [isAuthenticated, fetchUserInfo]);

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
