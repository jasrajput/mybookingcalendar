import Event from "../models/eventModel.js"
import generateToken from "../utils/tokenGenerator.js"

// @desc    get user's events
// @route   GET /api/events
// @access  private
export const getEvents = async (req, res, next) => {
    try {
        const events = await Event.find({user: req.user.id})

        if(events) {
            res.status(200).json({ events, token: generateToken(req.user.id) })
        } else {
            res.status(400).json({ message: 'No events found for this user' })
        }
    } catch (error) {
        next(error)
    }
}

// @desc    get single event
// @route   GET /api/events/[:id]
// @access  public
export const getEvent = async (req, res, next) => {
    try {
        // UPDATE 2 ****************************************************************
        let event
        if(req.params.id.includes('eventName=')) {
            const eventName = req.params.id.split('&')[0].split('=')[1].replaceAll('FORWARDSLASH','/')
            const eventDescription = req.params.id.split('&')[1].split('=')[1].replaceAll('FORWARDSLASH','/')

            event = await Event.find({name: eventName, description: eventDescription})
        } else {
            event = await Event.findById(req.params.id)
        }
        // UPDATE 2 END ****************************************************************

        if(event) {
            res.status(200).json({ event })
        } else {
            res.status(400).json({ message: 'Invalid event id' })
        }
    } catch (error) {
        next(error)
    }
}

// @desc    create a new event
// @route   POST /api/events
// @access  private
export const createEvent = async (req, res, next) => {
    try {
        const { name, location, description, duration, meetingHours, daysAdvance, onConfirmation, redirectURL, eventType, team, timeZone } = req.body

        const event = await Event.create({name, location, description, duration, meetingHours: JSON.stringify(meetingHours), daysAdvance, onConfirmation, redirectURL, user: req.user.id, eventType, team: (eventType === 'Team Event') ? team : null, timeZone})

        if(event) {
            res.status(201).json({ event, token: generateToken(req.user.id) })
        } else {
            res.status(400).json({ message: 'Unable to create an event. Please try again later' })
        }
    } catch (error) {
        next(error)
    }
}

// REVISION 1 ***************************************************************
// @desc    delete event
// @route   DELETE /api/events/:id
// @access  private
export const deleteEvent = async (req, res, next) => {
    try {
        const eventFound = await Event.findById(req.params.id)

        if(eventFound) {
            if(eventFound.user.toString() === req.user._id.toString()) {
                const eventRemoved = await Event.findByIdAndRemove(req.params.id)
                
                if(eventRemoved) {
                    res.status(201).json({ message: 'Event deleted successfully', token: generateToken(req.user.id) })
                } else {
                    res.status(400).json({ message: 'Unable to delete an event. Please try again' })
                }
            } else {
                res.status(400).json({ message: 'User unauthorized' })
            }
        } else {
            res.status(400).json({message: 'Event not found'})
        }
    } catch (error) {
        next(error)
    }
}
// REVISION 1 END ***************************************************************

// UPDATE 1 ***************************************************************
// @desc    edit event
// @route   PUT /api/events/:id
// @access  private
export const editEvent = async (req, res, next) => {
    try {
        const eventFound = await Event.findById(req.params.id)

        if(eventFound) {
            if(eventFound.user.toString() === req.user._id.toString()) {
                const eventUpdated = await Event.findByIdAndUpdate(req.params.id, req.body, {
                    new: true
                })
                
                if(eventUpdated) {
                    res.status(200).json({ message: 'Event updated successfully', token: generateToken(req.user.id) })
                } else {
                    res.status(400).json({ message: 'Unable to edit an event. Please try again' })
                }
            } else {
                res.status(401).json({ message: 'User unauthorized' })
            }
        } else {
            res.status(400).json({message: 'Event not found'})
        }
    } catch (error) {
        next(error)
    }
}
// UPDATE 1 END ***************************************************************

// @desc        get all event names
// @route       POST /api/events/getEventNames
// @access      private
export const getEventNames = async (req, res, next) => {
    try {
        const allEventNames = await Promise.all(req.body.eventIds.map(async (id) => {
            const eventName = await Event.findById(id).select('name duration')
            return {
                eventId: id,
                eventName: eventName
            }
        }))

        res.status(200).json({ allEventNames, token: generateToken(req.user.id) })
    } catch (error) {
        next(error)
    }
}