import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
    events: [],
    event: null,
    eventNames: [],
    eventError: false,
    eventSuccess: false,
    eventLoading: false,
    eventMessage: ''
}

export const getEvents = createAsyncThunk('event/getEvents', async (_, thunkAPI) => {
    try {
        const response = await fetch(`/api/event/getEvents`)

        const data = await response.json()

        if(response.ok) {
            return data
        } else {
            throw data
        }
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message)
    }
})

export const getEventNames = createAsyncThunk('event/getEventNames', async (eventIds, thunkAPI) => {
    try {
        const response = await fetch(`/api/event/getEventNames`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({eventIds})
        })

        const data = await response.json()

        if(response.ok) {
            return data
        } else {
            throw data
        }
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message)
    }
})

export const getEvent = createAsyncThunk('event/getEvent', async (eventId, thunkAPI) => {
    try {
        const response = await fetch(`/api/event/${eventId}`)

        const data = await response.json()

        if(response.ok) {
            return data
        } else {
            throw data
        }
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message)
    }
})

export const createEvent = createAsyncThunk('event/createEvent', async (eventData, thunkAPI) => {
    try {
        const response = await fetch(`/api/event/createEvent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        })

        const data = await response.json()

        if(response.ok) {
            return data
        } else {
            throw data
        }
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message)
    }
})

// REVISION 1 ********************************************************************
export const deleteEvent = createAsyncThunk('event/deleteEvent', async (eventId, thunkAPI) => {
    try {
        const response = await fetch(`/api/event/deleteEvent?eventId=${eventId}`, {
            method: 'DELETE'
        })

        const data = await response.json()

        if(response.ok) {
            return data
        } else {
            throw data
        }
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message)
    }
})
// REVISION 1 END ********************************************************************

// UPDATE 1 ********************************************************************
export const editEvent = createAsyncThunk('event/editEvent', async (eventData, thunkAPI) => {
    try {
        const response = await fetch(`/api/event/editEvent?eventId=${eventData.eventId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        })

        const data = await response.json()

        if(response.ok) {
            return data
        } else {
            throw data
        }
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message)
    }
})
// UPDATE 1 END ********************************************************************

export const eventSlice = createSlice({
    name: 'event',
    initialState,
    reducers: {
        eventReset: state => {
            state.eventLoading = false,
            state.eventError = false,
            state.eventSuccess = false,
            state.eventMessage = ''
        },
        singleEventReset: state => {
            state.event = null
        }
    },
    extraReducers: builder => {
        builder.addCase(getEvents.pending, state => {
            state.eventLoading = true
        }).addCase(getEvents.fulfilled, (state, action) => {
            state.eventLoading = false
            state.events = action.payload
        }).addCase(getEvents.rejected, (state, action) => {
            state.eventLoading = false
            state.eventError = true
            state.eventMessage = action.payload
            state.events = []
        }).addCase(getEvent.pending, state => {
            state.eventLoading = true
        }).addCase(getEvent.fulfilled, (state, action) => {
            state.eventLoading = false
            state.event = action.payload
        }).addCase(getEvent.rejected, (state, action) => {
            state.eventLoading = false
            state.eventError = true
            state.eventMessage = action.payload
            state.event = null
        }).addCase(createEvent.pending, state => {
            state.eventLoading = true
        }).addCase(createEvent.fulfilled, (state, action) => {
            state.eventLoading = false
            state.eventSuccess = true
        }).addCase(createEvent.rejected, (state, action) => {
            state.eventLoading = false
            state.eventError = true
            state.eventMessage = action.payload
            state.events = []
        }).addCase(deleteEvent.pending, state => {
            state.eventLoading = true
        }).addCase(deleteEvent.fulfilled, (state, action) => {
            state.eventLoading = false
            state.eventSuccess = true
            state.eventMessage = action.payload.message
        }).addCase(deleteEvent.rejected, (state, action) => {
            state.eventLoading = false
            state.eventError = true
            state.eventMessage = action.payload
            state.events = []
        }).addCase(editEvent.pending, state => {
            state.eventLoading = true
        }).addCase(editEvent.fulfilled, (state, action) => {
            state.eventLoading = false
            state.eventSuccess = true
            state.eventMessage = action.payload.message
        }).addCase(editEvent.rejected, (state, action) => {
            state.eventLoading = false
            state.eventError = true
            state.eventMessage = action.payload.message
            state.events = []
        }).addCase(getEventNames.pending, state => {
            state.eventLoading = true
        }).addCase(getEventNames.fulfilled, (state, action) => {
            state.eventLoading = false
            state.eventNames = action.payload
        }).addCase(getEventNames.rejected, (state, action) => {
            state.eventLoading = false
            state.eventError = true
            state.eventMessage = action.payload.message
            state.eventNames = []
        })
    }
})

export const { eventReset, singleEventReset } = eventSlice.actions

export default eventSlice.reducer