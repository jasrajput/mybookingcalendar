import express from 'express'
import {createNewTeam, getAllTeams, getAllTeamMembers, deleteTeam, updateTeam} from '../controllers/teamController.js'
import protect from '../middlewares/authMiddleware.js'

const router = express.Router()

router.route('/').post(protect, createNewTeam).get(protect, getAllTeams)

router.route('/:id').delete(protect, deleteTeam).put(protect, updateTeam)

router.route('/:id/members').get(getAllTeamMembers)

export default router