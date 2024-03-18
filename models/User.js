import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    }

}, { timestamps: true });

UserSchema.pre('save', async function (next) {
    var user = this;
    if (!user.isModified('password'))
        return next();

    try {
        const salt = await bcryptjs.genSalt(10);
        const secPassword = await bcryptjs.hash(user.password, salt);
        user.password = secPassword;
    } catch (error) {
        next(error);
    }
});

UserSchema.methods.validatePassword = async function (password) {
    try {
        const res = await bcryptjs.compare(password, this.password);
        return res;
    } catch (error) {
        console.log(error.message);
    }
}

UserSchema.methods.generateToken = async function () {
    try {
        return jwt.sign({
            userId: this._id.toString(),
            email: this.email,
        }, process.env.JWT_SECRET, { expiresIn: "10d" })
    } catch (error) {
        console.log(error);
    }
}

const User = mongoose.model('user', UserSchema);
export default User;