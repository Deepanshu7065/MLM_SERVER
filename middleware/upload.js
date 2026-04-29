import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// 1. Cloudinary Configure karein
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'courses',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'avif'],
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            return file.fieldname + '-' + uniqueSuffix;
        },
    },
});

// 3. Multer Setup
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadCourseImage = upload.single('image');