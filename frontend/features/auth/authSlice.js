import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isError: false,
  isSuccess: false,
  isLoading: true,
  message: "",
};

export const checkUserLoggedIn = createAsyncThunk(
  "auth/getUser",
  async (_, thunkAPI) => {
    try {
      const response = await fetch(`/api/auth/user`, {
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

export const register = createAsyncThunk(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      const res = await fetch(`/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (res.ok) {
        return data;
      } else {
        throw data;
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      const res = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (res.ok) {
        return data;
      } else {
        throw data;
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const getTokens = createAsyncThunk(
  "auth/getTokens",
  async (code, thunkAPI) => {
    try {
      const res = await fetch("/api/auth/getTokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (res.ok) {
        return data;
      } else {
        throw data;
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    const response = await fetch(`/api/auth/logout`, {
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
});

// REVISION 1 *******************************************
// store time zones to show in DB
export const editTimeZones = createAsyncThunk(
  "auth/editTimeZone",
  async (_, thunkAPI) => {
    try {
      const timeZonesToShow = thunkAPI.getState().timeZone.timeZonesToShow;
      const response = await fetch(`/api/auth/editTimeZone`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ timeZonesToShow }),
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

// store home time zone state in DB
export const saveHomeTimeZone = createAsyncThunk(
  "auth/saveHomeTimeZone",
  async (_, thunkAPI) => {
    try {
      const homeTimeZone = thunkAPI.getState().timeZone.homeTimeZone;
      const response = await fetch(`/api/auth/homeTimeZone`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ homeTimeZone }),
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

// remove account access from DB
export const disconnectAccount = createAsyncThunk(
  "auth/disconnectAccount",
  async (accountName, thunkAPI) => {
    try {
      const response = await fetch(
        `/api/auth/disconnectAccount?accountName=${accountName}`,
        {
          method: "PUT",
        }
      );

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
// REVISION 1 END *****************************************************

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      (state.isLoading = false),
        (state.isError = false),
        (state.isSuccess = false),
        (state.message = "");
    },
    // REVISION 2 **************************************
    updateUserTimeZonesToShow: (state, action) => {
      state.user.timeZonesToShow = action.payload;
    },
    // REVISION 2 END **************************************
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.user = null;
        state.message = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.user = null;
        state.message = action.payload;
      })
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(checkUserLoggedIn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkUserLoggedIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(checkUserLoggedIn.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
      })
      .addCase(getTokens.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTokens.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(getTokens.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(disconnectAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(disconnectAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, updateUserTimeZonesToShow } = authSlice.actions;

export default authSlice.reducer;
