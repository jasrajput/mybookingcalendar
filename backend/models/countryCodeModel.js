import mongoose from 'mongoose'

const countryCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Please add the country code']
    },
    countryName: {
        type: String, 
        required: [true, 'Please add the country name']
    }
}, { timeStamps: true })

const countryCodeModel = mongoose.model('countryCode', countryCodeSchema)

export default countryCodeModel