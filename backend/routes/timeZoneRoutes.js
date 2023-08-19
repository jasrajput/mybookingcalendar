import express from 'express'
import { getData } from '../controllers/timeZoneController.js'

const router = express.Router()

router.route('/').get(getData)

export default router