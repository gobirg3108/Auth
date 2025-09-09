import mongoose from 'mongoose'
import argon2 from 'argon2'

const adminSchema = new mongoose.Schema({
    email: { type: String, unique: true, trim: true },
    password: { type: String }
}, { timestamps: true })

// Hash Password (argon2 method)
adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    try {
        this.password = await argon2.hash(this.password)
        next()
    } catch (error) {
        next(error)
    }
})

// Password Compare
adminSchema.methods.matchPassword = async function (enteredPassword) {
    try {
        return await argon2.verify(this.password, enteredPassword)
    } catch (error) {
        return false
    }
}

export default mongoose.model("Admin", adminSchema) 
