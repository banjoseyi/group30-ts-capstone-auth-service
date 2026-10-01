import cloudinary from "../config/cloudinary.js";

const uploadImage = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "capstone-auth-project/profile-images",
                resource_type: "image",
                transformation: [
                    {
                        width: 500,
                        height: 500,
                        crop: "fill",
                        gravity: "face"
                    }
                ]
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            }
        );

        uploadStream.end(fileBuffer);
    });
};

export default uploadImage;