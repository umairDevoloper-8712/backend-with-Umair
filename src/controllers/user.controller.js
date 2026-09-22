import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudainry.js";
import { ApiRespons } from "../utils/ApiRespons.js";
import JWT from "jsonwebtoken"




const generateAccessAndRefreshToken = async (userId) => {
    try {

        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.genrateRefreshTokrn()

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }

    } catch (error) {

        throw new ApiError(500, "somethng went wrong while creating access or refresh token")

    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { email, fullName, password, userName } = req.body
    if (
        [email, fullName, password, userName].some((fields) =>
            fields?.trim() === ""
        )
    ) {
        throw new ApiError
            (400, "All fields are requried")

    }

    const userExist = await User.findOne({
        $or: [{ email }, { userName }]

    })
    if (userExist) {
        throw new ApiError(409, "user already existed")

    }

    const avatarLocalpath = req.files?.avatar?.[0]?.path;
    const coverImageLocalpath = req.files?.coverImage?.[0]?.path;


    if (!avatarLocalpath) {
        throw new ApiError(400, "avatar is requried")

    }

    const avatar = await uploadOnCloudinary(avatarLocalpath)

    const coverImage = await uploadOnCloudinary(coverImageLocalpath)

    if (!avatar) {
        throw new ApiError(400, "Avatar files is requried")
    }

    const user = await User.create(
        {
            fullName,
            password,
            email,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            userName: userName.toLowerCase()
        },

    )

    const createduser = await User.findById(user._id).select("-password -refreshToken")

    if (!createduser) {
        throw new ApiError(400, "something went wrong while registring user")

    }

    return res.status(201).json(
        new ApiRespons(200, createduser, "user created successfully")
    )


})

const loginUser = asyncHandler(async (req, res,) => {
    //algorithm for login user
    // req.body => data
    //email or userName lyna
    //find user
    //check password
    //access and refresh token
    //send cookies
    //response
    const { email, password, userName } = req.body
    if (!(userName || email)) {
        throw new ApiError(400, "email or user name is required");


    }

    const user = await User.findOne({
        $or: [{ email }, { userName }]
    })
    if (!user) {
        throw new ApiError(404, "user not exsist ");


    }
    const passwordValid = await user.isPasswordCorret(password)

    if (!passwordValid) {
        throw new ApiError(401, "password is not correct ");


    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    // aur cookie/json mein bhi refreshToken use karein

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        screenTopecure: true
    }
    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiRespons(
                200,
                {
                    loggedInUser, accessToken, refreshToken
                }
            )
        )


})
const logoutUser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined

            },

        }
        , {
            new: true
        })
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiRespons(200, {}, "user loggedout")
        )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const inComingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!inComingRefreshToken) {

        throw new ApiError(401, "unauthorazied access")

    }

    try {
        const decodedToken = JWT.verify(
            inComingRefreshToken,
            process.env.REFRESH_TOKEN_SECRECT
        )
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(400, "invalid refresh token")

        }
        if (inComingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "unauthorized or used token ")
        }

        const { newRefreshToken, accessToken } = await generateAccessAndRefreshToken(user._id)

        const options = {
            httpOnly: true,
            secure: true
        }
        return res
            .status(200)
            .cookie("refreshToken", newRefreshToken, options)
            .cookie("accessToken", accessToken, options)
            .json(
                new ApiRespons(
                    200,
                    {
                        accessToken, refreshToken: newRefreshToken
                    },
                    "Access token Refreshed"
                )
            )
    } catch (error) {

        throw new ApiError(401, error?.message || "invalid access token")

    }
})
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req.user?._id)

    const isPasswordCorret = await user.isPasswordCorret(oldPassword)

    if (!isPasswordCorret) {

        throw new ApiError(401, "please enter the correct password")

    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(
            new ApiRespons(200, {}, "password changed succefully")
        )

})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiRespons(
            200, req.user, "get user uccessfully")
        )
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body
    if (!email || !fullName) {

        throw new ApiError(401, "all field arerequre")

    }
    const user = await User.findByIdAndUpdate(
        res.user?._id,
        {
            $set: {
                fullName,
                email
            }

        },
        {
            new: true
        }
    ).select("-password")

    return res
        .Status(200)
        .json(new ApiRespons(200, user, "update succesfully"))
})

const updateAvatr = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {

        throw new ApiError(401, "avatr path is missing")

    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(401, "avatr url is missing on cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password")
    return res
        .Status(200)
        .json(new ApiRespons(200, user, "update succesfully"))
})
const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {

        throw new ApiError(401, "avatr path is missing")

    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar.url) {
        throw new ApiError(401, "CoverImage url is missing on cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password")
    return res
        .Status(200)
        .json(new ApiRespons(200, user, "update succesfully"))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentPassword,
    updateAccountDetails,
    updateAvatr,
    updateCoverImage
}