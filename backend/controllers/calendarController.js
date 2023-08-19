import { google } from 'googleapis'
import { DateTime } from 'luxon'
import User from '../models/userModel.js'
import generateToken from '../utils/tokenGenerator.js'
import { v4 as uuidv4 } from'uuid'
import Event from '../models/eventModel.js'
import sendEmail from '../utils/sendEmail.js'
import axios from 'axios'

// @desc    get all calendars
// @route   GET /api/calendar
// @access  private
export const getCalendars = async (req, res, next) => {
    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.FRONTEND_URL,
        )

        oauth2Client.setCredentials({ refresh_token: req.user.googleRefreshToken, access_token: req.user.googleAccessToken })
        
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
        
        const calendarRes = await calendar.calendarList.list()

        res.status(200).json({ calendars: calendarRes.data.items, token: generateToken(req.user._id) })
    } catch (error) {
        next(error)
    }
}

// @desc    get all events from calendar
// @route   GET /api/calendar/events
// @access  private
export const getEvents = async (req, res, next) => {
    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.FRONTEND_URL,
        )

        oauth2Client.setCredentials({ refresh_token: req.user.googleRefreshToken, access_token: req.user.googleAccessToken })
        
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
        
        const calendarRes = await calendar.events.list({ calendarId: 'primary', orderBy: 'startTime', singleEvents: true, timeMin: (req.query.date !== 'undefined') ? DateTime.now().set({ day: req.query.date}).minus({ days: 2 }).startOf('day').toISO() : req.query.from, timeMax: (req.query.date !== 'undefined') ? DateTime.now().set({ day: req.query.date}).plus({ days: 2 }).endOf('day').toISO() : req.query.to })
            
        if(calendarRes) {
            res.status(200).json({ events: calendarRes.data.items, token: generateToken(req.user._id) })
        } else {
            res.status(500).json({ message: "Something went wrong. Please try again" })
        }
    } catch (error) {
        next(error)
    }
}

// @desc    insert calendar event
// @route   POST /api/calendar/events
// @access  public
export const insertEvent = async (req, res, next) => {
    try {
        const { name, eventName, email, start, end, question, userId, location, eventId, eventDescription, meetingLink, meetingPassword } = req.body

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.FRONTEND_URL,
        )

        const user = await User.findById(userId)

        if(user) {
            oauth2Client.setCredentials({ refresh_token: user.googleRefreshToken, access_token: user.googleAccessToken })
            
            const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
            
            const calendarRes = await calendar.events.insert({ calendarId: 'primary', conferenceDataVersion: `${location === 'Google meet' ? 1 : 0}`, sendUpdates: 'all', requestBody: {
                summary: `${name} and ${user.name}`,
                description: `
Event name: ${eventName}

Event Description: ${eventDescription}

Location: ${location}

You can join this meeting from your computer, tablet, or smartphone.
${(location === 'Zoom') ? `${meetingLink}<br/>` : ''}
${(location === 'Zoom') ? `password: ${meetingPassword}<br/>` : ''}
${question ? `Question: ${question}<br />` : ''}
Powered by Mybookingcalendar.co`,
                attendees: [
                    {
                        "email": email,
                        responseStatus: "accepted"
                    },
                    {
                        "email": user.email,
                        "organizer": true,
                        responseStatus: "accepted"
                    }
                ],
                location: location,
                
                conferenceData: {
                    createRequest: {
                        conferenceSolutionKey: {
                            type: "hangoutsMeet"
                        },
                        requestId: uuidv4()
                    }
                },
                start: {
                    "dateTime": start
                },
                end: {
                    "dateTime": end
                }
    
            } })

            if(calendarRes) {
                const eventFound = await Event.findById(eventId)

                const updatedBookedHours = eventFound.bookedHours.filter(hour => hour >= DateTime.now().set({hour: 0, minute: 0}).toISO())

                // adding the current booking
                updatedBookedHours.push(start)

                // UPDATE 2 ********************************************************************
                // iterating through each booking object and updating the booking time for which the eventId is matched
                let newEvent = []
                let eventIdFound = false
                const updatedBookingDetails = user.bookingDetails.map((booking, index) => {
                    if(booking.eventDetails.eventId.toString() === eventId) {
                        eventIdFound = true
                        // remove the older booking hours for this event
                        const updatedHours = booking.eventDetails.bookedHours.filter(hour => DateTime.fromISO(hour) >= DateTime.now().startOf('day'))
                        // insert the current booking hour
                        updatedHours.push(start)

                        booking.eventDetails.bookedHours = updatedHours
                        return booking
                    } else {
                        // inserting the new event booking details if no previous booking for this event is found
                        if((user.bookingDetails.length === (index + 1)) && (eventIdFound === false)) {
                            newEvent.push({
                                eventDetails: {
                                    eventId,
                                    bookedHours: [start]
                                }
                            })
                        }
                        return booking
                    }
                })

                // if there is some item pushed into the newEvent array, then it means that there is some new event booked for the user
                if(newEvent.length > 0) {
                    updatedBookingDetails.push(...newEvent)
                }

                // if this is the first time an event is booked for a user, then insert the first event 
                if(updatedBookingDetails.length === 0) {
                    updatedBookingDetails.push({
                        eventDetails: {
                            eventId,
                            bookedHours: [start]
                        }
                    })
                }

                await User.findByIdAndUpdate(userId, {$set: { bookingDetails: updatedBookingDetails }})
                // UPDATE 2 END ********************************************************************

                const eventUpdated = await Event.updateOne({_id: eventId}, {$set: {bookedHours: updatedBookedHours}})

                // sending email to organiser and attendee
                await sendEmail({ email: [user.email], subject: `New Event: ${name} - ${DateTime.fromISO(start).setZone(user.homeTimeZone).toLocaleString(DateTime.TIME_SIMPLE)} ${DateTime.fromISO(start).setZone(user.homeTimeZone).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)} - ${eventName}`, message: `
                <div style="margin:auto;font-size:1rem;width:50%">
                    <br/>
                    Hi ${user.name},<br/><br/>

                    A new event has been scheduled.<br/><br/>

                    <b>Event Type:</b><br/>
                    ${eventName}<br/><br/>

                    <b>Invitee:</b><br/>
                    ${name}<br/><br/>

                    <b>Invitee Email:</b><br/>
                    ${email}<br/><br/>

                    <b>Event Date/Time:</b><br/>
                    ${DateTime.fromISO(start).setZone(user.homeTimeZone).toLocaleString(DateTime.TIME_SIMPLE)} - ${DateTime.fromISO(start).setZone(user.homeTimeZone).toLocaleString(DateTime.DATE_MED)} (${DateTime.now().setZone(user.homeTimeZone).offsetNameLong})<br/><br/>

                    <b>Description:</b><br/>
                    ${eventDescription}<br/><br/>

                    <b>Location:</b><br/>
                    ${location}
                    ${meetingLink ? meetingLink : ''}

                    ${question ? '<br/><br/><b>Questions:</b><br/>' : ''}
                    ${question ? question : ''}
                </div>
                ` })

                res.status(200).json({ event: calendarRes })
            } else {
                res.status(500).json({message: 'Meeting cannot be scheduled due to server error. Please try again.'})
            }
    
        } else {
            res.status(400).json({message: "Event owner not found"})
        }

    } catch (error) {
        next(error)
    }
}

// UPDATE 2 **************************************************************
// @desc    update calendar event
// @route   PUT /api/calendar/events
// @access  private
export const updateEvent = async (req, res, next) => {
    try {
        const { name, eventName, email, start, end, question, userId, location, eventId, calendarEventId, eventDescription, meetingLink, meetingPassword, rescheduleReason, formerStart, cancellationReason } = req.body

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.FRONTEND_URL,
        )

        const user = await User.findById(userId)

        if(user) {
            oauth2Client.setCredentials({ refresh_token: user.googleRefreshToken, access_token: user.googleAccessToken })
            
            const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
            
            const calendarRes = await calendar.events.patch({ calendarId: 'primary', eventId: calendarEventId, conferenceDataVersion: `${location === 'Google meet' ? 1 : 0}`, sendUpdates: 'all', requestBody: {
                summary: `${cancellationReason ? 'Canceled: ' : 'Rescheduled: '}${name} and ${user.name}`,
                description: `
Event name: ${eventName}

Event Description: ${eventDescription}

Location: ${location}

${
cancellationReason ? `${cancellationReason ? `Event cancelled: ${cancellationReason}<br />` : ''}` : `You can join this meeting from your computer, tablet, or smartphone.
${(location === 'Zoom') ? `${meetingLink}<br/>` : ''}
${(location === 'Zoom') ? `password: ${meetingPassword}<br/>` : ''}
${question ? `Question: ${question}<br />` : ''}
${rescheduleReason ? `Event rescheduled: ${rescheduleReason}<br />` : ''}`}
Powered by Mybookingcalendar.co`,
                attendees: [
                    {
                        "email": email,
                        responseStatus: cancellationReason ? "declined" : "accepted"
                    },
                    {
                        "email": user.email,
                        "organizer": true,
                        responseStatus: cancellationReason ? "declined" : "accepted"
                    }
                ],
                start: {
                    "dateTime": start
                },
                end: {
                    "dateTime": end
                }
            } })

            if(calendarRes) {
                const eventFound = await Event.findById(eventId)

                // this will return all the hours except the one for which the event is rescheduled or cancelled
                const updatedBookedHours = eventFound.bookedHours.filter(hour => ((hour >= DateTime.now().set({hour: 0, minute: 0}).toISO()) && (formerStart ? (hour !== DateTime.fromISO(formerStart).toISO()) : true) && (cancellationReason ? (hour !== DateTime.fromISO(start).toISO()) : true)))

                // UPDATE 2 ***********************************************************************
                // adding the current booking only if it is a reschedule request
                if(!cancellationReason) {
                    updatedBookedHours.push(start)
                }
                // UPDATE 2 END ***********************************************************************

                // UPDATE 2 ********************************************************************
                // iterating through each booking object and updating the booking time for which the eventId is matched
                let newEvent = []
                let eventIdFound = false
                const updatedBookingDetails = user.bookingDetails.map((booking, index) => {
                    if(booking.eventDetails.eventId.toString() === eventId) {
                        eventIdFound = true
                        // remove the older booking hours for this event
                        const updatedHours = booking.eventDetails.bookedHours.filter(hour => (DateTime.fromISO(hour) >= DateTime.now().startOf('day') && (formerStart ? (hour !== DateTime.fromISO(formerStart).toISO()) : true) && (cancellationReason ? (hour !== DateTime.fromISO(start).toISO()) : true) ))
                        
                        // insert the current booking hour if it is a reschedule event
                        if(!cancellationReason) {
                            updatedHours.push(start)
                        }

                        booking.eventDetails.bookedHours = updatedHours
                        return booking
                    } else {
                        // inserting the new event booking details if no previous booking for this event is found
                        if((user.bookingDetails.length === (index + 1)) && (eventIdFound === false)) {
                            newEvent.push({
                                eventDetails: {
                                    eventId,
                                    bookedHours: [start]
                                }
                            })
                        }
                        return booking
                    }
                })

                // if there is some item pushed into the newEvent array, then it means that there is some new event booked for the user
                if(newEvent.length > 0) {
                    updatedBookingDetails.push(...newEvent)
                }

                // if this is the first time an event is booked for a user, then insert the first event 
                if(updatedBookingDetails.length === 0) {
                    updatedBookingDetails.push({
                        eventDetails: {
                            eventId,
                            bookedHours: [start]
                        }
                    })
                }

                await User.findByIdAndUpdate(userId, {$set: { bookingDetails: updatedBookingDetails }})
                // UPDATE 2 END ********************************************************************

                const eventUpdated = await Event.updateOne({_id: eventId}, {$set: {bookedHours: updatedBookedHours}})

                // sending email to organiser and attendee
                await sendEmail({ email: [user.email], subject: `
                ${
                    cancellationReason ? (
                        `
                        Canceled: ${eventName} with ${name} on ${DateTime.fromISO(start).setZone(user.homeTimeZone).toLocaleString(DateTime.DATE_MED)}
                        `
                    ) : (
                        `
                        Updated Event: ${name} - ${DateTime.fromISO(start).setZone(user.homeTimeZone).toLocaleString(DateTime.TIME_SIMPLE)} ${DateTime.fromISO(start).setZone(user.homeTimeZone).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)} - ${eventName}
                        `
                    )
                }
                `, 
                message: `
                <div style="margin:auto;font-size:1rem;width:50%">
                    <br/>
                    Hi ${user.name},<br/><br/>

                    An event has been ${cancellationReason ? 'canceled' : 'rescheduled'}.<br/><br/>

                    <b>Event Type:</b><br/>
                    ${eventName}<br/><br/>

                    <b>Invitee:</b><br/>
                    ${name}<br/><br/>

                    <b>Invitee Email:</b><br/>
                    ${email}<br/><br/>

                    <b>Event Date/Time:</b><br/>
                    ${
                        rescheduleReason ? (
                            `
                                <span style="color:#939393;text-decoration:line-through">Former: 
                                    ${DateTime.fromISO(formerStart).setZone(user.homeTimeZone).toLocaleString(DateTime.TIME_SIMPLE)} - ${DateTime.fromISO(formerStart).setZone(user.homeTimeZone).toLocaleString(DateTime.DATE_MED)} (${DateTime.now().setZone(user.homeTimeZone).offsetNameLong})<br/>
                                </span>
                                <span style="color:#30bf5b">Updated: 
                                    ${DateTime.fromISO(start).setZone(user.homeTimeZone).toLocaleString(DateTime.TIME_SIMPLE)} - ${DateTime.fromISO(start).setZone(user.homeTimeZone).toLocaleString(DateTime.DATE_MED)} (${DateTime.now().setZone(user.homeTimeZone).offsetNameLong})<br/><br/>
                                </span>
                            `
                        ) : (
                            `
                                ${DateTime.fromISO(start).setZone(user.homeTimeZone).toLocaleString(DateTime.TIME_SIMPLE)} - ${DateTime.fromISO(start).setZone(user.homeTimeZone).toLocaleString(DateTime.DATE_MED)} (${DateTime.now().setZone(user.homeTimeZone).offsetNameLong})<br/><br/>
                            `
                        )
                    }

                    ${rescheduleReason ? `<b><span style="color:#e41600">Rescheduled by ${req.user.name}</span></b>` : ''}
                    ${rescheduleReason ? `<br/><span style="color:#e41600">Reason - ${rescheduleReason}</span><br/><br/>` : ''}
                    
                    ${cancellationReason ? `<span style="color:#e41600">Cancellation Reason - ${cancellationReason}</span><br/>` : ''}
                    ${cancellationReason ? `<b><span style="color:#e41600">Canceled by ${req.user.name}</span></b><br/><br/>` : ''}

                    <b>Description:</b><br/>
                    ${eventDescription}<br/><br/>

                    <b>Location:</b><br/>
                    ${location}
                    ${meetingLink ? meetingLink : ''}

                    ${question ? '<br/><br/><b>Questions:</b><br/>' : ''}
                    ${question ? question : ''}

                </div>
                ` })

                res.status(200).json({ event: calendarRes, token: generateToken(req.user._id) })
            } else {
                res.status(500).json({message: 'Meeting cannot be scheduled due to server error. Please try again.'})
            }
    
        } else {
            res.status(400).json({message: "Event owner not found"})
        }

    } catch (error) {
        next(error)
    }
}
// UPDATE 2 END **************************************************************

// @desc    create zoom meeting
// @route   POST /api/calendar/events/meetings
// @access  public
export const createZoomMeeting = async (req, res, next) => {
    try {
        const { eventName, description, start, duration, email, userId } = req.body
        
        const user = await User.findById(userId)
        
        // get new tokens if the last time tokens received were more than 1 hour ago. new access tokens expire after 1 hour
        if(user && (DateTime.fromISO(user.zoomData.accessTokenTime).plus({hour: 1}).setZone(DateTime.now().zoneName) < DateTime.now())) {
            const tokenResponse = await axios.post(`https://zoom.us/oauth/token`, null, {
                headers: {
                    'Authorization': `Basic ${Buffer.from(process.env.ZOOM_API_CLIENT_ID+':'+process.env.ZOOM_API_CLIENT_SECRET).toString('base64')}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                params: {
                    'grant_type': 'refresh_token',
                    'refresh_token': user.zoomRefreshToken
                }
            })

            
            const userUpdated = await User.updateOne({email: user.email}, {$set: {
                zoomAccessToken: tokenResponse.data.access_token,
                zoomRefreshToken: tokenResponse.data.refresh_token,
                zoomScopes: tokenResponse.data.scope,
                "zoomData.accessTokenTime": DateTime.now().toISO()
            }})
            
            if(userUpdated) {
                const meetingResponse = await axios.post(`https://api.zoom.us/v2/users/me/meetings`, {
                    "agenda": description,
                    "topic": eventName,
                    "duration": duration,
                    "start_time": start,
                    "settings": {
                        "calendar_type": 2,
                        "meeting_invitees": [
                            {
                                email
                            }
                        ]
                    }
                }, {
                    headers: {
                        "Authorization": `Bearer ${tokenResponse.data.access_token}`
                    }
                })
        
                res.status(201).json({meetingRes: meetingResponse.data})
            } else {
                res.status(400).json({message: 'Event owner not found'})
            }

        } else {
            if(!user) {
                res.status(400).json({message: "Event owner not found"})
            } else if(DateTime.fromISO(user.zoomData.accessTokenTime).plus({hour: 1}).setZone(DateTime.now().zoneName) > DateTime.now()) {
                const meetingResponse = await axios.post(`https://api.zoom.us/v2/users/me/meetings`, {
                    "agenda": description,
                    "topic": eventName,
                    "duration": duration,
                    "start_time": start,
                    "settings": {
                        "calendar_type": 2,
                        "meeting_invitees": [
                            {
                                email
                            }
                        ]
                    }
                }, {
                    headers: {
                        "Authorization": `Bearer ${user.zoomAccessToken}`
                    }
                })
        
                res.status(201).json({meetingRes: meetingResponse.data})
            } else {
                res.status(500).json({message: 'Something went wrong. Please try again later.'})
            }
        }


    } catch (error) {
        next(error)
    }
}