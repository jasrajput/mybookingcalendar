import express from 'express'
import passport from 'passport'
import { loginUser, registerUser, getUser, getTokens, googleCallback, editTimeZone, saveHomeTimeZone, disconnectAccount, getAllUsers, zoomDeauthorize } from '../controllers/authController.js'
import protect from '../middlewares/authMiddleware.js'

const router = express.Router()

router.route('/').post(registerUser).get(protect, getAllUsers)

router.post('/get-tokens', protect, getTokens)

// redirects to the google login screen to take consent from the user to share profile data 
router.route('/google').get(passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'], accessType: 'offline', approvalPrompt: 'force' }))

router.get('/google/callback', passport.authenticate('google', { failureRedirect: `/api/auth/oauth/fail` }), googleCallback)

router.get('/oauth/fail', (req, res) => {
    res.status(401)
    res.redirect(process.env.FRONTEND_URL)
})


router.route('/login').post(loginUser)

router.route('/me').get(protect, getUser)

// REVISION 1 ************************************************************************
router.route('/time-zone').put(protect, editTimeZone)

router.route('/home-time-zone').put(protect, saveHomeTimeZone)

router.route('/disconnect').put(protect, disconnectAccount)

router.route('/zoom/deauthorize').post(zoomDeauthorize)
// REVISION 1 END ************************************************************************

export default router