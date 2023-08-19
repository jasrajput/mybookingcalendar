import TimeZone from '../models/timeZoneModel.js'
import CountryCode from '../models/countryCodeModel.js'

// @desc        GET timezone and country code data
// @route       /api/timeZone
// @access      public
export const getData = async (req, res, next) => {
    try {
        const timeZones = await TimeZone.find({})
        const countryCodes = await CountryCode.find({})

        if(timeZones && countryCodes) {
            res.status(200).json({ timeZones, countryCodes })
        } else {
            res.status(401).json({ message: 'No data found' })
        }
    } catch (error) {
        next(error)
    }
}