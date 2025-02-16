// backend/routes/account.js
const express = require('express');
const router = express.Router()
const { Mongoose, default: mongoose, mongo } = require('mongoose');
const authMiddleware = require('../middleware')
const {Account} = require("../db")
const accountRouter = express.Router();

// Get the balance
router.get("/balance", authMiddleware, async (req, res) => {
    const account = await Account.findOne({
        userId: req.userId
    });

    res.json({
        balance: account.balance
    })
})

// transfer money to another account

// const transferAccount = zod.object({
    // userId:zod.string(),
    // balance:zod.number()
// })

router.get("/transfer", authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    const {amount, to} = req.body
    const account = await User.findOne({
        userId:req.userId
    }).session(session);

    if (account.balance < amount) {
        return res.status(400).json({
            message: "Insufficient Balance"
        })
    }

    const toAccount = await User.findOne({
        userId: to
    }).session(session);

    if(!toAccount) {
        return res.status(400).json({
            message: "Invalid account"
        })
    }

    await Account.updateOne({userId:req.userId}, {$inc:{balance: -amount}}).session(session);
    await Account.updateOne({userId:to}, {$inc:{balance: amount}}).session(session);

    await session.commitTransaction();
    res.json({
        message: "Transfer successful"
    })
})


module.exports = accountRouter;