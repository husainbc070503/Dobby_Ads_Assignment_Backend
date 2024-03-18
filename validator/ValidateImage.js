import { z } from 'zod';

const AddImage = z.object({
    name: z
        .string({ required_error: "Name is required" })
        .min(1, { message: "Name is required" })
        .trim(),

    image: z
        .string({ required_error: "Image is required" })
        .min(1, { message: "Image is required" })
});

export default AddImage;