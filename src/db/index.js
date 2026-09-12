import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const DbConnection = async () => {
  try {
    // "/?" ko "/DB_NAME?" se replace kar rahe hain taake path mein DB name aa jaye
    const uri = process.env.MONGODB_URI.replace("/?", `/${DB_NAME}?`);

    const connectionInstence = await mongoose.connect(uri);
    console.log(`Mongoose Db Connection !! Host ${connectionInstence.connection.host}`);
  } catch (error) {
    console.log("error in Data base connection : ", error);
    process.exit(1);
  }
};

export default DbConnection;