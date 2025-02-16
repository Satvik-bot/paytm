const express = require("express");
const zod = require("zod")
const router = express.Router()
const {User, Account} = require('../db');
const jwt = require("jsonwebtoken");
const JWT_SECRET = require('../config');
const authMiddleware = require("../middleware");

// Zod Schema
const signupSchema = zod.object({
    username: zod.string(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string()
})

router.post("/signup", async (req, res) => {
    const body = req.body;
    const { success } = signupSchema.safeParse(body)

    // Zod authentication
    if (!success) {
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }

    // Check if user exists
    const existingUser = await User.findOne({
        username: body.username
    })

    if (existingUser) {
        return res.status(411).json({
            message: "Email already taken/Incorrect inputs"
        })
    }

    // Assign user a token
    const newUser = await User.create(body)

    await Account.create({
        userId: newUser._id,
        balance: 1 + Math.random()*10000
    })

    const token = jwt.sign({
        userId: newUser._id
    }, JWT_SECRET)

    res.json({
        userId: "userId of newly added user"
    })

})

const signinBody = zod.object({
    username: zod.string().email(),
    password: zod.string()
})

router.post("/signin", async (req, res) => {
    const body = req.body
    const { success } = signinBody.safeParse(body)

    if (!success) {
        res.status(411).json({
            message: "Incorrect inputs!"
        })
    }

    const user = await User.findOne({
        username: body.username,
        password: body.password
    })

    if (user) {
        const token = jwt.sign({
            userId: body.username
        }, JWT_SECRET)

        res.status(200).json({
            token: token
        })
        return;
    }

    res.status(411).json({
        message: "Error while logging in."
    })
})

const updateCredentials = zod.object({
    password: zod.string()
        .min(8, "Password must be atleast 8 characters")
        .max(64, "Password cannot exceed 64 characters")
        .optional(),
    firstName: zod.string()
        .min(2, "First name must be at least 2 characters")
        .max(50, "First name cannot exceed 50 characters")
        .trim()
        .optional(),
    lastName: zod.string()
        .min(2, "First name must be at least 2 characters")
        .max(50, "First name cannot exceed 50 characters")
        .trim()
        .optional()
})

// Update user creds
router.put("/", authMiddleware, async (req, res) => {
    const body = req.body;
    const { success } = updateCredentials.safeParse(body)

    if (!success) return res.status(411).json({ message: "Error while updating information" });

    await User.awaitOne(req.body, {
        _id: req.userId
    })

    res.json({
        message: "Updated successfully"
    })


})

// Search for User with ?queryparams "filter"
router.get("/bulk", authMiddleware, async (req, res) => {
    const filter = req.param.filter || "";

    const users = await User.find({
        $or: [
            { name: { "$regex": filter } },
            { lastname: { "$regex": filter } }
        ]
    });

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })

})

module.exports = router
