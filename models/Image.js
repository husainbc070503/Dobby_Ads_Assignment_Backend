import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },

    name: {
        type: String,
        required: true
    },

    image: {
        type: String,
        required: true
    }

}, { timestamps: true });

const Image = mongoose.model('image', ImageSchema);
export default Image;