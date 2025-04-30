import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.route.js'
dotenv.config()
const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(cookieParser())
app.get("/", (req, res) => {
    res.send("Welcome to Code Run")
})

app.use('/api/v1/user', authRoutes)

app.listen(port, () => {
    console.log("Server is running on Port:", port);
})
