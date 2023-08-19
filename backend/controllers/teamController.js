import generateToken from "../utils/tokenGenerator.js";
import Team from '../models/teamModel.js'
import User from '../models/userModel.js'
import Event from '../models/eventModel.js'


// @desc     create a new team
// @route    POST /api/team
// @access   private
export const createNewTeam = async (req, res, next) => {
    try {
        const {teamName, teamMembers, teamOwner, priorityVal} = req.body

        // make sure that there are no two teams with the same name for the same user/owner
        const allTeams = await Team.find({teamOwner: req.user._id})
        const nameAlreadyExists = allTeams.filter(team => team.teamName.toLowerCase() === teamName.toLowerCase())

        if(nameAlreadyExists.length > 0) {
            res.status(400).json({message: 'Team name already exist. Please choose a different name.'})
            return
        }

        const newTeam = await Team.create({ teamName, teamMembers, teamOwner, priority: priorityVal })

        if(newTeam) {
            res.status(201).json({message: 'New team created successfully', token: generateToken(req.user._id)})
        } else {
            res.status(400).json({message: 'Something went wrong. Please try again later'})
        }
    } catch (error) {
        next(error)
    }
}

// @desc        get all teams of a user
// @route       GET /api/team
// @access      private
export const getAllTeams = async (req, res, next) => {
    try {
        const allTeams = await Team.find({teamOwner: req.user._id})

        if(allTeams) {
            res.status(200).json({allTeams, token: generateToken(req.user._id)})
        } else {
            res.status(500).json({message: 'Something went wrong. Please try again later.'})
        }
    } catch (error) {
        next(error)
    }
}

// @desc        get team from id
// @route       GET /api/team/:id
// @access      public
export const getTeam = async (req, res, next) => {
    try {
        const team = await Team.findById(req.params.id)

        if(team) {
            res.status(200).json({team})
        } else {
            res.status(400).json({message: 'Team does not exist'})
        }
    } catch (error) {
        next(error)
    }
}

// @desc        get all team members
// @route       GET /api/team/:id/members
// @access      public
export const getAllTeamMembers = async (req, res, next) => {
    try {
        const team = await Team.findById(req.params.id)

        // let UserData = []
        if(team) {
            const teamMembers = await Promise.all(team.teamMembers.map(async (member) => {
                // fetch the data for this member
                const userData = await User.findById(member).lean()
                return userData
            }))

            // get the booked hours for each user
            const updatedTeamMembers = await Promise.all(teamMembers.map(async (mem) => {
                // find the event duration for each event
                return {name: mem.name, userId: mem._id, priority: team.priority?.find(obj => obj.userId.toString() === mem._id.toString()).priorityVal, bookingDetails: await Promise.all(mem.bookingDetails.map(async (event) => {
                    const eventDuration = await Event.findById(event.eventDetails.eventId).select('duration')
                    // if the event is not deleted, then get its duration and append it in the object
                    if(eventDuration) {
                        event.eventDetails.duration = await eventDuration.duration
                    } else {
                        event.eventDetails.duration = '0'
                    }
                    return event
                }))}
            }))

            res.status(200).json({allTeamMembers: updatedTeamMembers})
        } else {
            res.status(500).json({message: 'Something went wrong. Please try again later.'})
        }
    } catch (error) {
        next(error)
    }
}

// @desc        delete a team of a user
// @route       DELETE /api/team/:id
// @access      private
export const deleteTeam = async (req, res, next) => {
    try {
        const team = await Team.findById(req.params.id)

        // if the logged in user is the team owner only then he/she can delete the event
        if(team.teamOwner.toString() === req.user._id.toString()) {
            const teamRemoved = await Team.findByIdAndRemove(req.params.id)

            if(teamRemoved) {
                res.status(200).json({message: 'Team removed successfully', token: generateToken(req.user._id)})
            } else {
                res.status(500).json({message: 'Something went wrong. Please try again later.'})
            }
        } else {
            res.status(403).json({message: 'You are not authorized to perform this action'})
        }
    } catch (error) {
        next(error)
    }
}

// @desc        update team details
// @route       PUT /api/team/:id
// @access      private
export const updateTeam = async (req, res, next) => {
    try {
        const team = await Team.findById(req.params.id)

        if(team.teamOwner.toString() === req.user._id.toString()) {
            const teamUpdated = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true })

            if(teamUpdated) {
                res.status(200).json({message: 'Team updated successfully', token: generateToken(req.user.id) })
            } else {
                res.status(400).json({ message: 'Unable to edit the team. Please try again' })
            }
        } else {
            res.status(403).json({message: 'You are not authorized to perform this action'})
        }
    } catch (error) {
        next(error)
    }
}