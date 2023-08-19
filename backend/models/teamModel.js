import mongoose from 'mongoose'

const teamSchema = new mongoose.Schema({
    teamName: {
        type: String,
        required: [true, 'Team name is required']
    },
    teamMembers: {
        type: [mongoose.Schema.Types.ObjectId],
        required: [true, 'Team members cannot be empty']
    },
    teamOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    priority: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        priorityVal: {
            type: String
        }
    }]
}, { timestamps: true })

const teamModel = mongoose.model('Team', teamSchema)

export default teamModel