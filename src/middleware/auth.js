const User = require('../models/user')
const jwt = require('jsonwebtoken')

const auth = async (req, res, next) =>{
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)    //contains { _id: 'id of the user', iat: time-stamp of type nmber }
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token})

        if(!user){
            throw new Error()
        }
        req.token = token 
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({'error': 'Invalid authentication!'})
    }
}

module.exports = auth