import {Router} from 'express'
import { registerUser, loginUser, logoutUser, checkUser } from '../controllers/auth.controller.js'
import { isLoggedIn } from '../middleware/auth.middleware.js'
const authRoutes = Router()

authRoutes.post('/register', registerUser)
authRoutes.post('/login', loginUser)
authRoutes.post('/logout', isLoggedIn,logoutUser)
authRoutes.get('/check',isLoggedIn, checkUser)

export default authRoutes