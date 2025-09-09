import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'
import cors from 'cors'
import express from 'express'
import adminRoutes from './routes/adminRoutes.js'

const { MONGO_URI, PORT } = process.env

const app = express()

//Middleware
app.use(express.json())
app.use(cors())

//Routes
app.use('/admin', adminRoutes)

//DB Connection
mongoose.connect(MONGO_URI)
    .then(() => console.log("Mongo DB Connected 😝"))
    .catch((err) => console.error("Mongo DB Connection Failed 😫", err))

//Server Connection
app.listen(PORT, () => {
    console.log(`Server Running On ${PORT}`)
})