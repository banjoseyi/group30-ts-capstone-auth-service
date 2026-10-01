import mongoose from "mongoose";
import bcrypt from "bcrypt"


const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        userName: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
            maxlength: 128,
            select: false
        },
        passwordChangedAt: {
            type: Date,
            default: null
        },
        passwordResetToken: {
            type: String,
            select: false
        },
        passwordResetExpiresAt: {
            type: Date,
            select: false
        },
        profileImage: {
            url: {
                type: String,
                default: null
            },
            publicId: {
                type: String,
                default: null
            }
        },
        status: {
            type: String,
            enum: ["active", "suspended"],
            default: "active"
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        }

    },
    { timestamps: true }
)

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 11);
});


userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};



const User = mongoose.model("User", userSchema);

export default User;