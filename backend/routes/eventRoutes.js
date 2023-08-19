import express from 'express'
import { createEvent, getEvent, getEvents, deleteEvent, editEvent, getEventNames } from '../controllers/eventController.js'
import protect from '../middlewares/authMiddleware.js'

const router = express.Router()

router.route('/').get(protect, getEvents).post(protect, createEvent)
router.route('/getEventNames').post(protect, getEventNames)
router.route('/:id').get(getEvent).delete(protect, deleteEvent).put(protect, editEvent)

export default router