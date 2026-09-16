import { asyncHandelr } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudainry.js";
import { ApiRespons } from "../utils/ApiRespons.js";



const registerUser = asyncHandelr(async (req, res) => {
    const   { email, fullName, password, userName } = req.body
    if (
        [email, fullName, password , userName].some((fields) =>
            fields?.trim() === ""
        )
    ) {
        throw new ApiError
            (400, "All fields are requried")

    }
    
    const userExist = await User.findOne({
        $or: [ { email },{ userName } ]

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

export { registerUser }