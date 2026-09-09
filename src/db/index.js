import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";



const DbConnection= async()=>{
try {

  const connectionInstence =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
  console.log(`Mongoose Db Connection !! Host ${connectionInstence.connection.host}`)
    
} catch (error) {
    console.log("error in Data base connection : ", error)
    process.exit(1)
    
}
}


export default  DbConnection