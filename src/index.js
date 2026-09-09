import dotenv, { config } from "dotenv"
import DbConnection from "./db/index.js";
import { app } from "./App.js";


dotenv.config({
    path: "./.env"
});




DbConnection()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`server is runing in port ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("acured a error during connect DB !!!!!", error)
})


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