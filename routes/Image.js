import { Router } from "express";
import FetchUser from "../middleware/FetchUser.js";
import ValidateInput from "../middleware/ValidateInput.js";
import AddImage from "../validator/ValidateImage.js";
import Image from "../models/Image.js";
const router = Router();

router.post('/addImage', FetchUser, ValidateInput(AddImage), async (req, res) => {
    try {
        var image = await Image.create({ ...req.body, user: req.user._id })
        image = await Image.findById(image._id)
            .populate('user', '-password');

        res.status(200).json({ success: true, image });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/editImage/:id', FetchUser, async (req, res) => {
    try {
        const image = await Image.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true })
            .populate('user', '-password');

        res.status(200).json({ success: true, image });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.delete('/deleteImage/:id', FetchUser, async (req, res) => {
    try {
        await Image.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.get('/images', FetchUser, async (req, res) => {
    try {
        const images = await Image.find().populate('user', '-password');
        res.status(200).json({ success: true, images });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

export default router;