import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
    calendars: null,
    events: [],
    eventRes: null,
    meetingRes: null,
    calendarError: false,
    calendarSuccess: false,
    calendarLoading: true,
    calendarMessage: ''
}

export const getCalendars = createAsyncThunk('calendar/getCalendars', async (_, thunkAPI) => {
    try {
        const response = await fetch('/api/calendar/getCalendars')

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

export const getEvents = createAsyncThunk('calendar/getEvents', async (_, thunkAPI) => {
    try {
        const date = thunkAPI.getState().timeZone.currentDate.day
        const response = await fetch(`/api/calendar/getEvents?date=${date}`)

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

// UPDATE 2 *******************************************************************
export const getEventsByDate = createAsyncThunk('calendar/getEventsByDate', async (dateInfo, thunkAPI) => {
    try {
        const response = await fetch(`/api/calendar/getEvents?from=${dateInfo.from.replace('+', '%2B')}&to=${dateInfo.to.replace('+', '%2B')}`)

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
// UPDATE 2 END *******************************************************************

export const createEvent = createAsyncThunk('calendar/createEvent', async (eventData, thunkAPI) => {
    try {
        const response = await fetch(`/api/calendar/createEvent`, {
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

// UPDATE 2 **********************************************************************
export const rescheduleEvent = createAsyncThunk('calendar/rescheduleEvent', async (eventData, thunkAPI) => {
    try {
        const response = await fetch(`/api/calendar/rescheduleEvent`, {
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
// UPDATE 2 END **********************************************************************

export const createZoomMeeting = createAsyncThunk('calendar/createZoomMeeting', async (meetingData, thunkAPI) => {
    try {
        const response = await fetch(`/api/calendar/createZoomMeeting`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(meetingData)
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

export const calendarSlice = createSlice({
    name: 'calendar',
    initialState,
    reducers: {
        reset: state => {
            state.calendarLoading = false,
            state.calendarError = false,
            state.calendarSuccess = false,
            state.calendarMessage = '',
            state.eventRes = null,
            state.meetingRes = null
        }
    },
    extraReducers: builder => {
        builder.addCase(getCalendars.pending, state => {
            state.calendarLoading = true
        }).addCase(getCalendars.fulfilled, (state, action) => {
            state.calendarLoading = false
            state.calendars = action.payload
        }).addCase(getCalendars.rejected, (state, action) => {
            state.calendarLoading = false
            state.calendarError = true
            state.calendarMessage = action.payload
            state.calendars = null
        }).addCase(getEvents.pending, state => {
            state.calendarLoading = true
        }).addCase(getEvents.fulfilled, (state, action) => {
            state.calendarLoading = false
            state.events = action.payload
        }).addCase(getEvents.rejected, (state, action) => {
            state.calendarLoading = false
            state.calendarError = true
            state.calendarMessage = action.payload
            state.events = []
        }).addCase(createEvent.pending, state => {
            state.calendarLoading = true
        }).addCase(createEvent.fulfilled, (state, action) => {
            state.calendarLoading = false
            state.eventRes = action.payload
        }).addCase(createEvent.rejected, (state, action) => {
            state.calendarLoading = false
            state.calendarError = true
            state.calendarMessage = action.payload
            state.eventRes = null
        }).addCase(createZoomMeeting.pending, state => {
            state.calendarLoading = true
        }).addCase(createZoomMeeting.fulfilled, (state, action) => {
            state.calendarLoading = false
            state.meetingRes = action.payload
        }).addCase(createZoomMeeting.rejected, (state, action) => {
            state.calendarLoading = false
            state.calendarError = true
            state.calendarMessage = action.payload
            state.meetingRes = null
        }).addCase(rescheduleEvent.pending, state => {
            state.calendarLoading = true
        }).addCase(rescheduleEvent.fulfilled, (state, action) => {
            state.calendarLoading = false
            state.eventRes = action.payload
        }).addCase(rescheduleEvent.rejected, (state, action) => {
            state.calendarLoading = false
            state.calendarError = true
            state.calendarMessage = action.payload
            state.eventRes = null
        }).addCase(getEventsByDate.pending, state => {
            state.calendarLoading = true
        }).addCase(getEventsByDate.fulfilled, (state, action) => {
            state.calendarLoading = false
            state.events = action.payload
        }).addCase(getEventsByDate.rejected, (state, action) => {
            state.calendarLoading = false
            state.calendarError = true
            state.calendarMessage = action.payload
            state.events = []
        })
    }
})

export const { reset } = calendarSlice.actions

export default calendarSlice.reducer