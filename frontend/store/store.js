import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import timeZoneReducer from "../features/timeZone/timeZoneSlice";
import calendarReducer from "../features/calendar/calendarSlice";
import eventReducer from "../features/event/eventSlice";
import supportReducer from "../features/support/supportSlice";
import chatReducer from "../features/chat/chatSlice";
import userReducer from "../features/user/userSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    timeZone: timeZoneReducer,
    calendar: calendarReducer,
    event: eventReducer,
    support: supportReducer,
    chat: chatReducer,
    user: userReducer,
  },
  // devTools: false,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["setCurrentDate"],
        // Ignore these field paths in all actions
        ignoredActionPaths: ["meta.arg", "payload.timestamp", "payload"],
        // Ignore these paths in the state
        ignoredPaths: ["items.dates", "timeZone.currentDate"],
      },
    }),
});
