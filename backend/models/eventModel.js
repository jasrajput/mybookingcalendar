import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        required: [true, 'Event name is required'],
        unique: [true, 'Event name should be unique']
    },
    location: {
        type: String,
        required: [true, 'Location is required']
    },
    description: {
        type: String,
        required: [true, 'Event location is required']
    },
    duration: {
        type: String,
        required: [true, 'Event duration is required']
    },
    meetingHours: {
        type: String,
        required: [true, 'Meeting hours is required']
    },
    bookedHours: {
        type: [String],
        default: null
    },
    // REVISION 1 ********************************************
    daysAdvance: {
        type: String,
        required: [true, 'Advance days is required']
    },
    // REVISION 1 END ********************************************
    // UPDATE 1 ***********************************************
    onConfirmation: {
        type: String,
        required: [true, 'On confirmation field is required']
    },
    redirectURL: {
        type: String
    },
    // UPDATE 1 END ***********************************************
    // UPDATE 2 ***************************************************
    eventType: {
        type: String,
        required: [true, 'Event type field is required']
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    },
    timeZone: {
        type: String
    }
    // UPDATE 2 END ***************************************************
}, { timestamps: true })

eventSchema.index({name: 1, description: 1}, { unique: true })

const eventModel = mongoose.model('Event', eventSchema)

export default eventModel