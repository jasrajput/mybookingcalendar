import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  tickets: [],
  ticket: null,
  supportError: false,
  supportSuccess: false,
  supportLoading: false,
  supportMessage: "",
};

export const getAllTicketsForAdmin = createAsyncThunk(
  "support/getAllTickets",
  async (_, thunkAPI) => {
    try {
      const response = await fetch(`/api/support/getAllTickets`, {
        method: "GET",
      });

      const data = await response.json();
      console.log(data);
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

export const getTickets = createAsyncThunk(
  "support/getTickets",
  async (_, thunkAPI) => {
    try {
      const response = await fetch(`/api/support/getTickets`, {
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

export const getTicket = createAsyncThunk(
  "support/getTicket",
  async (ticketId, thunkAPI) => {
    try {
      const response = await fetch(`/api/support/${ticketId}`);

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

export const createTicket = createAsyncThunk(
  "support/createTicket",
  async (ticketData, thunkAPI) => {
    try {
      const response = await fetch(`/api/support/createTicket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ticketData),
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

// REVISION 1 ********************************************************************
export const closeTicket = createAsyncThunk(
  "support/closeTicket",
  async (ticketId, thunkAPI) => {
    try {
      const response = await fetch(
        `/api/support/closeTicket?ticketId=${ticketId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
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
// REVISION 1 END ********************************************************************

// UPDATE 1 ********************************************************************
// export const editEvent = createAsyncThunk(
//   "event/editEvent",
//   async (eventData, thunkAPI) => {
//     try {
//       const response = await fetch(
//         `/api/event/editEvent?eventId=${eventData.eventId}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(eventData),
//         }
//       );

//       const data = await response.json();

//       if (response.ok) {
//         return data;
//       } else {
//         throw data;
//       }
//     } catch (error) {
//       return thunkAPI.rejectWithValue(error.message);
//     }
//   }
// );
// UPDATE 1 END ********************************************************************

export const supportSlice = createSlice({
  name: "support",
  initialState,
  reducers: {
    supportReset: (state) => {
      (state.supportLoading = false),
        (state.supportError = false),
        (state.supportSuccess = false),
        (state.supportMessage = "");
    },
    singleSupportReset: (state) => {
      state.ticket = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTickets.pending, (state) => {
        state.supportLoading = true;
      })
      .addCase(getTickets.fulfilled, (state, action) => {
        state.supportLoading = false;
        state.tickets = action.payload;
      })
      .addCase(getTickets.rejected, (state, action) => {
        state.supportLoading = false;
        state.supportError = true;
        state.supportMessage = action.payload;
        state.tickets = [];
      })
      .addCase(getAllTicketsForAdmin.pending, (state) => {
        state.supportLoading = true;
      })
      .addCase(getAllTicketsForAdmin.fulfilled, (state, action) => {
        state.supportLoading = false;
        state.tickets = action.payload;
      })
      .addCase(getAllTicketsForAdmin.rejected, (state, action) => {
        state.supportLoading = false;
        state.supportError = true;
        state.supportMessage = action.payload;
        state.tickets = [];
      })
      .addCase(getTicket.pending, (state) => {
        state.supportLoading = true;
      })
      .addCase(getTicket.fulfilled, (state, action) => {
        state.supportLoading = false;
        state.supportSuccess = true;
        state.ticket = action.payload;
      })
      .addCase(getTicket.rejected, (state, action) => {
        state.supportLoading = false;
        state.supportError = true;
        state.supportMessage = action.payload;
        state.ticket = null;
      })
      .addCase(createTicket.pending, (state) => {
        state.supportLoading = true;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.supportLoading = false;
        state.supportSuccess = true;
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.supportLoading = false;
        state.supportError = true;
        state.supportMessage = action.payload;
        state.tickets = [];
      })
      .addCase(closeTicket.pending, (state) => {
        state.supportLoading = true;
      })
      .addCase(closeTicket.fulfilled, (state, action) => {
        state.supportLoading = false;
        state.supportSuccess = true;
        state.supportMessage = action.payload.message;
      })
      .addCase(closeTicket.rejected, (state, action) => {
        state.supportLoading = false;
        state.supportError = true;
        state.supportMessage = action.payload.message;
        state.tickets = [];
      });
  },
});

export const { supportReset, singleSupportReset } = supportSlice.actions;

export default supportSlice.reducer;
