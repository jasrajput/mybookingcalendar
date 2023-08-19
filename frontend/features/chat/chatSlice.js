import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
  message: null,
  messageError: false,
  messageSuccess: false,
  messageLoading: false,
  messageMessage: "",
};

export const getAllMessages = createAsyncThunk(
  "chat/getMessages",
  async (id, thunkAPI) => {
    try {
      const response = await fetch(`/api/chat/${id}`, {
        method: "GET",
      });

      const data = await response.json();
      if (response.ok) {
        return data;
      } else {
        throw data;
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (messageData, thunkAPI) => {
    try {
      const response = await fetch(`/api/chat/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        throw data;
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const chatSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    messageReset: (state) => {
      (state.messageLoading = false),
        (state.messageError = false),
        (state.messageSuccess = false),
        (state.messageMessage = "");
    },
    singleMessageReset: (state) => {
      state.messages = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllMessages.pending, (state) => {
        state.messageLoading = true;
      })
      .addCase(getAllMessages.fulfilled, (state, action) => {
        state.messageLoading = false;
        state.messageSuccess = true;
        state.messages = action.payload;
      })
      .addCase(getAllMessages.rejected, (state, action) => {
        state.messageLoading = false;
        state.messageError = true;
        state.messageMessage = action.payload;
        state.messages = [];
      })
      .addCase(sendMessage.pending, (state) => {
        state.messageLoading = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messageLoading = false;
        state.messageSuccess = true;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.messageLoading = false;
        state.messageError = true;
        state.messageMessage = action.payload;
        state.messages = [];
      });
  },
});

export const { messageReset, singleMessageReset } = chatSlice.actions;

export default chatSlice.reducer;
