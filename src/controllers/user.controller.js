import { asyncHandelr } from "../utils/asynchandler.js";



const registerUser = asyncHandelr(async (req, res) => {
    res.status(200).json({
        message: "wellcome umair ou creat a first api"
    })
})

export {registerUser}