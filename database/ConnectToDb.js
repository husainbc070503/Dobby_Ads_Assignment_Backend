import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const url = process.env.MONGODB_URL;

const connecToDB = async () => {
    mongoose.set('strictQuery', false);
    try {
        await mongoose.connect(url, () => console.log('Connected to mongo db database'));
    } catch (error) {
        console.log(error.message);
    }
}

export default connecToDB;