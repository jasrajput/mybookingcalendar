import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { DateTime } from 'luxon'

const initialState = {
    timeZones: [],
    timeZonesToShow: [],
    countryCodes: [],
    homeTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    twentyFourHourFormat: false,
    currentDate: DateTime.now().setZone(Intl.DateTimeFormat().resolvedOptions().timeZone),
    isError: false,
    isSuccess: false,
    isLoading: true,
    message: ''
}

export const getData = createAsyncThunk('timeZone/getData', async (_, thunkAPI) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/timeZone/getData`)

        const data = await res.json()

        if(res.ok) {
            return data
        } else {
            throw data
        }
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message)
    }
})

export const timeZoneSlice = createSlice({
    name: 'timeZone',
    initialState,
    reducers: {
        reset: state => {
            state.isLoading = false,
            state.isSuccess = false,
            state.isError = false,
            state.message = ''
        },
        setHomeTimeZone: (state, action) => {
            state.homeTimeZone = action.payload
        },
        restoreHomeTimeZoneState: (state, action) => {
            state.homeTimeZone = action.payload
        },
        setTwentyFourHour: (state, action) => {
            state.twentyFourHourFormat = action.payload
        },
        setCurrentDate: (state, action) => {
            state.currentDate = action.payload
        },
        setTimeZonesToShow: (state, action) => {
            if(state.timeZonesToShow.length >= 10) {
                state.isError = true
                state.message = 'You can add only 10 time zones at a time'
                return
            }
            // check if the timezone is already shown in the UI
            if(state.timeZonesToShow.find(timeZone => timeZone.TZDatabaseName === action.payload.TZDatabaseName || (timeZone.STDOffset === action.payload.STDOffset && timeZone.DSTOffset === action.payload.DSTOffset && timeZone.STDAbbreviation === action.payload.STDAbbreviation && timeZone.DSTAbbreviation === action.payload.DSTAbbreviation) )) {
                if(state.timeZonesToShow.length > 1) {
                    state.isError = true
                    state.message = 'Already added'
                }
                return
            }
            state.timeZonesToShow = [...state.timeZonesToShow, action.payload]
        },
        removeTimeZoneFromUI: (state, action) => {
            state.timeZonesToShow = state.timeZonesToShow.filter(timeZone => timeZone.TZDatabaseName !== action.payload.TZDatabaseName)
        },
        // REVISION 1 **********************************************************
        // restore the time zone state for the logged in user
        restoreUserTimeZoneState: (state, action) => {
            state.timeZonesToShow = action.payload
        }
        // REVISION 1 END ******************************************************
    },
    extraReducers: (builder) => {
        builder.addCase(getData.pending, (state, action) => {
            state.isLoading = true
        }).addCase(getData.fulfilled, (state, action) => {
            state.isLoading = false
            state.timeZones = action.payload.timeZones
            state.countryCodes = action.payload.countryCodes
        }).addCase(getData.rejected, (state, action) => {
            state.isLoading = false,
            state.isError = true,
            state.timeZones = [],
            state.countryCodes = [],
            state.message = action.payload
        })
    }
})

export const { reset, setHomeTimeZone, setTwentyFourHour, setCurrentDate, setTimeZonesToShow, removeTimeZoneFromUI, restoreUserTimeZoneState, restoreHomeTimeZoneState } = timeZoneSlice.actions

export default timeZoneSlice.reducer