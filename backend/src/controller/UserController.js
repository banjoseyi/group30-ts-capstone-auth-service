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

        return res.status(201).json({
            success: true,
            message: "Account Registerd successfully",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
            }
        })
    } catch (error) {
        next(error);
    }
}

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            throw new AppError("Invalid email or password", 404);
        }

        const passwordMatches = await bcrypt.compare(
            password, user.password
        );

        if (!passwordMatches) {
            throw new AppError("Invalid email or password", 404);
        }

        return res.status(200).json({
            success: true,
            message: "Login successful",

            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {
        next(error);
    }
}


export default { registerUser, loginUser };