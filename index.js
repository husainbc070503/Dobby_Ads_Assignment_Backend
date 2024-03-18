import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import ErrorHandler from "./handler/ErrorHandler.js";
import connecToDB from "./database/ConnectToDb.js";
import Authentication from './routes/User.js';
import Image from './routes/Image.js';

dotenv.config();
const app = express();
const port = process.env.PORT;

connecToDB();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => res.send("Hello World"));
app.use('/api/user', Authentication);
app.use('/api/image', Image);

app.use(ErrorHandler);
app.listen(port, () => console.log(`Server running on port ${port}`));