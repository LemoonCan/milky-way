import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Comment {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}

interface Like {
  id: string;
  userId: string;
  createdAt: string;
}

interface Moment {
  id: string;
  authorId: string;
  content: string;
  images?: string[];
  visibility: 'public' | 'friends' | 'private';
  createdAt: string;
  likes: Like[];
  comments: Comment[];
  isLiked: boolean;
}

interface MomentsState {
  moments: Moment[];
  userMoments: Moment[];
  isLoading: boolean;
  hasMore: boolean;
}

const initialState: MomentsState = {
  moments: [],
  userMoments: [],
  isLoading: false,
  hasMore: true,
};

const momentsSlice = createSlice({
  name: 'moments',
  initialState,
  reducers: {
    setMoments: (state, action: PayloadAction<Moment[]>) => {
      state.moments = action.payload;
    },
    addMoment: (state, action: PayloadAction<Moment>) => {
      state.moments.unshift(action.payload);
      state.userMoments.unshift(action.payload);
    },
    deleteMoment: (state, action: PayloadAction<string>) => {
      state.moments = state.moments.filter(
        (moment) => moment.id !== action.payload
      );
      state.userMoments = state.userMoments.filter(
        (moment) => moment.id !== action.payload
      );
    },
    likeMoment: (
      state,
      action: PayloadAction<{ momentId: string; like: Like }>
    ) => {
      const moment = state.moments.find(
        (m) => m.id === action.payload.momentId
      );
      if (moment) {
        moment.likes.push(action.payload.like);
        moment.isLiked = true;
      }
    },
    unlikeMoment: (
      state,
      action: PayloadAction<{ momentId: string; userId: string }>
    ) => {
      const moment = state.moments.find(
        (m) => m.id === action.payload.momentId
      );
      if (moment) {
        moment.likes = moment.likes.filter(
          (like) => like.userId !== action.payload.userId
        );
        moment.isLiked = false;
      }
    },
    addComment: (
      state,
      action: PayloadAction<{ momentId: string; comment: Comment }>
    ) => {
      const moment = state.moments.find(
        (m) => m.id === action.payload.momentId
      );
      if (moment) {
        moment.comments.push(action.payload.comment);
      }
    },
    setUserMoments: (state, action: PayloadAction<Moment[]>) => {
      state.userMoments = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setMoments,
  addMoment,
  deleteMoment,
  likeMoment,
  unlikeMoment,
  addComment,
  setUserMoments,
  setLoading,
} = momentsSlice.actions;
export default momentsSlice.reducer;
