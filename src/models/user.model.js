
import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String,
        required: true,

    },
    coverImage: {
        type: String,

    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    refreshToken: {
        type: String,
    }
}, { timestamps: true })

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return 
        this.password = await bcrypt.hash(this.password, 10)
    
})
userSchema.methods.isPasswordCorret = async function (password) {

    return await bcrypt.compare(password, this.password)

}
userSchema.methods.generateAccessToken = function () {
    jwt.sign({
        _id: this._id,
        userName: this.userName,
        fullName: this.fullName,
        Email: this.Email
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.genrateRefreshTokrn = function () {
    jwt.sign({
        _id: this._id,

    },
        REFRESH_TOKEN_SECRECT_TOKEN - SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)