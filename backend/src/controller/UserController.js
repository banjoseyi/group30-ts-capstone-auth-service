import User from "../model/User.js";
import AppError from "../utils/AppError.js";


const registerUser = async (req, res, next) => {
    try {
        const { firstName, lastName, username, email, password } = req.body;

        const existingUser = await User.findOne({ email })

        if (existingUser) {
            throw new AppError("An account with this email already exists", 409);
        }

        const user = await User.create({
            firstName,
            lastName,
            username,
            email,
            password
        })

        return res.status(200).json({
            success: false,
            message: "Account Registerd successfully",
            user: {
                id: user._id,
                name: user.name,
                Username: user.username,
                email: user.email,
            }
        })
    } catch (error) {
        next(error);
    }
}


export default { registerUser};