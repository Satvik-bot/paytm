const express = require("express");
const zod = require("zod")
const router = express.Router()
const User = require('../db');
const jwt = require("jsonwebtoken");
const JWT_SECRET = require('../config')

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

module.exports = router
