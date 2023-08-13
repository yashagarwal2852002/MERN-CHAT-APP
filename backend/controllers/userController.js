const asyncHandler = require("express-async-handler");
const User = require('../Models/userModel');
const generateToken = require('../config/generateToken');

// Call Back Function for sign up of the user
const registerUser = async (req, res) => {
    const { name, email, password, pic } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please Enter all the Fields");
    }

    const userExist = await User.findOne({ email: email });
    if (userExist) {
        res.status(400);
        throw new Error("User already exist");
    }

    const user = await User.create({
        name,
        email,
        password,
        pic,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: await generateToken(user._id),
        });
    }
    else {
        res.status(400);
        throw new Error("Faild to create the User");
    }
};

// CallBack Function to handle Login Functionalities
const authUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: await generateToken(user._id),
        })
    } else {
        res.status(400);
        throw new Error("Faild to access the User");
    }
};

// Function to Search user by Name and Email Address :- /api/user?search=piyush
const allUsers = async(req, res) => {
    const keyword = req.query.search ? {
            $or: [
                { name: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } },
            ],
        } : {};
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);
};

module.exports = { registerUser, authUser, allUsers };