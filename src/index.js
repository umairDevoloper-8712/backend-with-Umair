import dotenv, { config } from "dotenv"
import DbConnection from "./db/index.js";


dotenv.config({
    path: "./.env"
});





// (async()=>{
//     try {
//        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//        app.on("error", (error)=>{
//         console.log("ERROR:",error)
//         throw error
//        })

//        app.listen(process.env.PORT,()=>{
//         console.log(`app is listing on ${process.env.PORT}`)
//        })
//     } catch (error) {
//         console.log("ERROR:", error)
//         throw error
        
//     }
// })()