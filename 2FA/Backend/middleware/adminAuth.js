import jwt from 'jsonwebtoken'
import AdminSchema from '../models/AdminSchema.js'

const JWT_SECRET = process.env.JWT_SECRET

const protect = async (req,res,next) => {
    const authHeader = req.headers.authorization 

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({message:"No token, Unauthorized"})
    }

    try {
        const token = authHeader.split(" ")[1]
        const decode = jwt.verify(token, JWT_SECRET)
        
        req.admin = await AdminSchema.findById(decode.id).select("-password")

        if (!req.admin) {
            return res.status(401).json({ message: "Admin not found" })
            
        }
        next()
    } catch (error) {
       return res.status(401).json({message:"Invalid token"})
    }
}

export default protect