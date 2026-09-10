
import mongoose, { Schema } from "mongoose";
import mongooseagrigatepaginate from "mongoose-paginate-v2"

const videoSchema = new Schema({
    videoFile : {
type : String,
requried : true
    },
    thumNail: {
        type: String,


    },
    title: {
        type: String,
        requried: true,


    }, 
    description: {
        type: String,
        requried: true,
    },
duration: {
        type: Number,
        requried: true,
    },
    views:{
        type: Number,
        default: 0

    },
    isPublished:{
        type : Boolean,
        default : true

    },
    owner :{
        type : Schema.Types.ObjectId,
        ref :"User"
    }

}, { timestamps: true })

videoSchema.plugin(mongooseagrigatepaginate)

export const Video = mongoose.model("Video", videoSchema)