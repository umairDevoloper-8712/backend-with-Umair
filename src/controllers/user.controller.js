import { asyncHandelr } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudainry.js";
import { ApiRespons } from "../utils/ApiRespons.js";




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



const registerUser = asyncHandelr(async (req, res) => {
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

    if (!avatarLocalpath) {
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
        }
    )

    const createduser = await User.findById(user._id).select("-password -refreshToken")

    if (!createduser) {
        throw new ApiError(400, "something went wrong while registring user")

    }

    return res.status(201).json(
        new ApiRespons(200, createduser, "user created successfully")
    )


})

const loginUser = asyncHandelr(async (req, res,) => {
    //algorithm for login user
    // req.body => data
    //email or userName lyna
    //find user
    //check password
    //access and refresh token
    //send cookies
    //response
    const { email, password, userName } = req.body
    if (!userName || !email) {
        throw new ApiError(400, "email or user name is required");


    }

    const user = await User.findOne({
        $or: [{ email }, userName]
    })
    if (!user) {
        throw new ApiError(404, "user not exsist ");


    }
    const passwordValid = await user.isPasswordCorret(password)

    if (!passwordValid) {
        throw new ApiError(401, "password is not correct ");


    }

    const { accessToken, refreshTokrn } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password , -refreshToken")

    const options = {
        httpOnly: true,
        Secure: true
    }
    return res
        .status(200)
        .cookie("refreshToken", refreshTokrn, options)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiRespons(
                200,
                {
                    loggedInUser, accessToken, refreshTokrn
                }
            )
        )

    const logOutUser = asyncHandelr(async (req, res) => {
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
            Secure: true
        }
        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(
                new ApiRespons(200, {}, "user loggedout")
            )
    })

})

export { registerUser, loginUser, logOutUser }