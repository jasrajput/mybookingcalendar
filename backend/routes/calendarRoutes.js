import express from 'express'
import { getCalendars, getEvents, insertEvent, createZoomMeeting, updateEvent } from '../controllers/calendarController.js'
import protect from '../middlewares/authMiddleware.js'

const router = express.Router()

router.route('/').get(protect, getCalendars)
router.route('/events').get(protect, getEvents).post(insertEvent).put(protect, updateEvent)
router.route('/events/meetings').post(createZoomMeeting)

export default router