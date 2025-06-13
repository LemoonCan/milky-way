import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Friend {
  id: string;
  username: string;
  phone: string;
  avatar?: string;
  nickname?: string;
  tags: string[];
  addedAt: string;
  isBlocked: boolean;
  isOnline: boolean;
}

interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: string;
}

interface FriendsState {
  friends: Friend[];
  friendRequests: FriendRequest[];
  blacklist: Friend[];
  isLoading: boolean;
}

const initialState: FriendsState = {
  friends: [],
  friendRequests: [],
  blacklist: [],
  isLoading: false,
};

const friendsSlice = createSlice({
  name: 'friends',
  initialState,
  reducers: {
    setFriends: (state, action: PayloadAction<Friend[]>) => {
      state.friends = action.payload;
    },
    addFriend: (state, action: PayloadAction<Friend>) => {
      state.friends.push(action.payload);
    },
    removeFriend: (state, action: PayloadAction<string>) => {
      state.friends = state.friends.filter(
        (friend) => friend.id !== action.payload
      );
    },
    blockFriend: (state, action: PayloadAction<string>) => {
      const friend = state.friends.find((f) => f.id === action.payload);
      if (friend) {
        friend.isBlocked = true;
        state.blacklist.push(friend);
        state.friends = state.friends.filter((f) => f.id !== action.payload);
      }
    },
    unblockFriend: (state, action: PayloadAction<string>) => {
      const friend = state.blacklist.find((f) => f.id === action.payload);
      if (friend) {
        friend.isBlocked = false;
        state.friends.push(friend);
        state.blacklist = state.blacklist.filter(
          (f) => f.id !== action.payload
        );
      }
    },
    setFriendRequests: (state, action: PayloadAction<FriendRequest[]>) => {
      state.friendRequests = action.payload;
    },
    updateFriendRequest: (
      state,
      action: PayloadAction<{ id: string; status: FriendRequest['status'] }>
    ) => {
      const request = state.friendRequests.find(
        (req) => req.id === action.payload.id
      );
      if (request) {
        request.status = action.payload.status;
      }
    },
  },
});

export const {
  setFriends,
  addFriend,
  removeFriend,
  blockFriend,
  unblockFriend,
  setFriendRequests,
  updateFriendRequest,
} = friendsSlice.actions;
export default friendsSlice.reducer;
