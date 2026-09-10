
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
    Email: {
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
    Avatar: {
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

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(),
        this.password = bcrypt.hash(this.password, 10)
    next()
})
userSchema.methods.isPasswordCorret = async function (password) {

    return await bcrypt.compair(password, this.password)

}
userSchema.methods.generateAccessToken = function () {
    jwt.Sign({
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
userSchema.methods.geerateRefreshTokrn = function () {
    jwt.Sign({
        _id: this._id,

    },
        REFRESH_TOKEN_SECRECT_TOKEN - SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)