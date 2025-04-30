import jwt from 'jsonwebtoken'
import { db } from '../libs/db.js'

export const isLoggedIn = async (req, res, next) => {
    try {
        const token = req.cookies.token
    
        if(!token){
            return res.status(401).json({
                message: "Unauthorized User"
            })
        }
        let decodedToken
        try {
             decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        } catch (error) {
            return res.status(401).json({
                message: "Unauthorizes Token"
            })
        }
    
        const user = await db.user.findUnique({
            where: {
                id: decodedToken.id,
            },
            select: {
                email: true,
                id: true,
                image: true,
                role: true,
                name: true
            }
        })
    
        if(!user){
            return res.status(404).json({
                message: "User nor found"
            })
        }
    
        req.user = user
    
        next()
    } catch (error) {
        console.log("Error authenticating user", error.message);
        return res.status(500).json({
            message: "Error Authenticating User"
        })
    }

}