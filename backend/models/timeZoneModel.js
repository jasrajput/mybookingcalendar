import mongoose from 'mongoose'

const timeZoneSchema = new mongoose.Schema({
    TZDatabaseName: {
        type: String,
        required: [true, 'Please add the time zone name']
    },
    STDOffset: {
        type: String,
        required: [true, 'Please add the standard offset value']
    },
    DSTOffset: {
        type: String,
        required: [true, 'Please add the daylight saving offset value']
    },
    STDAbbreviation: {
        type: String,
        required: [true, 'Please add standard time zone abbreviation']
    },
    DSTAbbreviation: {
        type: String,
        required: [true, 'Please add daylight saving time zone abbreviation']
    }
}, { timestamps: true })

const timeZoneModel = mongoose.model('TimeZone', timeZoneSchema)

export default timeZoneModel