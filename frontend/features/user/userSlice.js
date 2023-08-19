import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
    allUsers: [],
    allTeams: [],
    allTeamMembers: [],
    userError: null,
    userLoading: false,
    userSuccess: false,
    userMessage: ''
}

export const getAllUsers = createAsyncThunk('user/getAllUsers', async (_, thunkAPI) => {
    try {
        const response = await fetch('/api/user/getAllUsers', {
            method: 'GET'
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


export const getAllTeams = createAsyncThunk('user/getAllTeams', async (_, thunkAPI) => {
    try {
        const response = await fetch('/api/user/getAllTeams', {
            method: 'GET'
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


export const getAllTeamMembers = createAsyncThunk('user/getAllTeamMembers', async (teamId, thunkAPI) => {
    try {
        const response = await fetch(`/api/user/getAllTeamMembers?teamId=${teamId}`, {
            method: 'GET'
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

export const createNewTeam = createAsyncThunk('user/createNewTeam', async (teamData, thunkAPI) => {
    try {
        const response = await fetch('/api/user/createNewTeam', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(teamData)
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

export const updateTeam = createAsyncThunk('user/updateTeam', async (teamData, thunkAPI) => {
    try {
        const response = await fetch(`/api/user/updateTeam?teamId=${teamData.teamId}`, {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(teamData)
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

export const deleteTeam = createAsyncThunk('user/deleteTeam', async (teamId, thunkAPI) => {
    try {
        const response = await fetch(`/api/user/deleteTeam?teamId=${teamId}`, {
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

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        userReset: state => {
            state.userError = false,
            state.userLoading = false,
            state.userSuccess = false,
            state.userMessage = ''
        }
    },
    extraReducers: builder => {
        builder.addCase(getAllUsers.pending, state => {
            state.userLoading = true
        }).addCase(getAllUsers.fulfilled, (state, action) => {
            state.userLoading = false,
            state.allUsers = action.payload
        }).addCase(getAllUsers.rejected, (state, action) => {
            state.userLoading = false,
            state.userError = true,
            state.allUsers = null,
            state.userMessage = action.payload
        }).addCase(createNewTeam.pending, (state, action) => {
            state.userLoading = true
        }).addCase(createNewTeam.fulfilled, (state, action) => {
            state.userLoading = false,
            state.userSuccess = true,
            state.userMessage = action.payload.message
        }).addCase(createNewTeam.rejected, (state, action) => {
            state.userLoading = false,
            state.userError = true,
            state.userMessage = action.payload
        }).addCase(getAllTeams.pending, (state, action) => {
            state.userLoading = true
        }).addCase(getAllTeams.fulfilled, (state, action) => {
            state.userLoading = false,
            state.allTeams = action.payload
        }).addCase(getAllTeams.rejected, (state, action) => {
            state.userLoading = false,
            state.userError = true,
            state.userMessage = action.payload
        }).addCase(getAllTeamMembers.pending, (state, action) => {
            state.userLoading = true
        }).addCase(getAllTeamMembers.fulfilled, (state, action) => {
            state.userLoading = false,
            state.allTeamMembers = action.payload
        }).addCase(getAllTeamMembers.rejected, (state, action) => {
            state.userLoading = false,
            state.userError = true,
            state.userMessage = action.payload
        }).addCase(deleteTeam.pending, (state) => {
            state.userLoading = true
        }).addCase(deleteTeam.fulfilled, (state, action) => {
            state.userLoading = false
            state.userSuccess = true
            state.userMessage = action.payload.message
        }).addCase(deleteTeam.rejected, (state, action) => {
            state.userLoading = false,
            state.userError = true,
            state.userMessage = action.payload
        }).addCase(updateTeam.pending, (state, action) => {
            state.userLoading = true
        }).addCase(updateTeam.fulfilled, (state, action) => {
            state.userLoading = false,
            state.userSuccess = true,
            state.userMessage = action.payload.message
        }).addCase(updateTeam.rejected, (state, action) => {
            state.userLoading = false,
            state.userError = true,
            state.userMessage = action.payload
        })
    }
})


export const { userReset } = userSlice.actions

export default userSlice.reducer