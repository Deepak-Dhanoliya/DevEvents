import { v2 as cloudinary } from "cloudinary";

// This automatically reads CLOUDINARY_URL from process.env
cloudinary.config({
  secure: true
});

export default cloudinary;
