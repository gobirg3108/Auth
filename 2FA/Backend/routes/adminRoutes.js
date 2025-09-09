import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import jwt from 'jsonwebtoken'
import AdminSchema from '../models/AdminSchema.js'

const router = express.Router()

//genarate JWT

const genarateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

// Admin Register

router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body
        const existingAdmin = await AdminSchema.findOne({ email })
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists" })
        }
        const admin = new AdminSchema({ email, password })
        await admin.save()
        const token = genarateToken(admin._id)
        res.status(200).json({ token, message: "Admin Created Successfully" })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

export default router