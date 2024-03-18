import { Router } from "express";
import ValidateInput from "../middleware/ValidateInput.js";
import { Register, Login, SendOtp, PasswordChange } from "../validator/Authenticate.js";
import User from "../models/User.js";
import FetchUser from "../middleware/FetchUser.js";
import Otp from "../models/Otp.js";
import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";
const router = Router();

const sendMail = async (name, email, otp) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        port: 587,
        secure: true,
        auth: {
            user: process.env.USER,
            pass: process.env.PASSWORD
        },
        tls: { rejectUnauthorized: false }
    });

    const options = {
        from: process.env.USER,
        to: email,
        subject: 'Dobby Ads Assignment - Change Password OTP',
        html: `<h4>Dear, ${name} <br> Thank you for choosing DAA. <br> To ensure the security of your account, please use the following One-Time Password (OTP) for updating password: <br>
        <h2> OTP: ${otp} </h2></h4> <h4> If you didn't requested this OTP or have any concerns about your account security, please contact our support team immediately. <br>Thank you for your cooperation.</h4>`
    }

    await new Promise((resolve, reject) => {
        transporter.sendMail(options, (err, info) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log('Email Sent Successfully.');
                resolve(info);
            }
        });
    });
}

const passwordUpdateMail = async (name, email) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        port: 587,
        secure: true,
        auth: {
            user: process.env.USER,
            pass: process.env.PASSWORD
        },
        tls: { rejectUnauthorized: false }
    });

    const options = {
        from: process.env.USER,
        to: email,
        subject: 'Dobby Ads Assignment - Password Updated',
        html: `<h4>Dear, ${name} <br> Thank you for choosing DAA. <br> Your password for your account has been updated. If it wasn't you, please contact us immediately. <br> Thank you</h4></h4>`
    }

    await new Promise((resolve, reject) => {
        transporter.sendMail(options, (err, info) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log("Emailed successfully");
                resolve(info);
            }
        })
    })
}

router.post('/register', ValidateInput(Register), async (req, res) => {
    try {
        var user = await User.findOne({ email: req.body.email });
        if (user)
            return res.status(400).json({ success: false, message: 'User already exists' });

        user = await User.create(req.body);
        res.status(200).json({ success: true, user });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.post('/login', ValidateInput(Login), async (req, res) => {
    try {
        const { email, password } = req.body;
        var user = await User.findOne({ email });
        if (!user || !await user.validatePassword(password))
            return res.status(400).json({ success: false, message: 'Invalid Credentials' });

        user = await User.findOne({ email }).select("-password")
        console.log(await user.generateToken());
        res.status(200).json({ success: true, user: { token: await user.generateToken(), user } });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/updateProfile', FetchUser, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user._id, { ...req.body }, { new: true }).select("-password");
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.post('/sendOtp', ValidateInput(SendOtp), async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ success: false, message: 'No user Fetched. Please Register' });

        const otp = await Otp.create({
            email,
            otp: Math.floor(1000 + Math.random() * 9000),
            expiresIn: new Date().getTime() * 5 * 60 * 1000
        })

        sendMail(user.name, email, otp.otp);
        res.status(200).json({ success: true, otp });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});

router.put('/updatePassword', ValidateInput(PasswordChange), async (req, res) => {
    const { otp, password, email } = req.body;

    try {
        const validOtp = await Otp.findOne({ email, otp });

        if (validOtp) {
            const diff = validOtp.expiresIn - new Date().getTime();

            if (diff < 0)
                return res.status(400).json({ success: false, message: 'OTP Expired' });

            const salt = await bcryptjs.genSalt(10);
            const secPass = await bcryptjs.hash(password, salt);

            const user = await User.findOneAndUpdate({ email }, { password: secPass }, { new: true });
            passwordUpdateMail(user.name, email);
            res.status(200).json({ success: true, user });
        }
        else {
            return res.status(400).json({ success: false, message: 'Invalid OTP' })
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});

export default router;