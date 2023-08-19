import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'

const protect = async (req, res, next) =>{
    let token

    try {
            if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
                // get token from header
                token = req.headers.authorization.split(' ')[1]

                if(!token){
                    res.status(401)
                    throw new Error('Not authorized, no token')
                }

                // verify token
                const decoded = jwt.verify(token, process.env.JWT_SECRET)

                // get user from the token
                req.user = await User.findById(decoded.id).select('-password')

                next()
            }else{
                throw new Error('No/Invalid token')
            }
        } catch (error) {
            res.status(401)
            next(error)
    }
}

export default protect