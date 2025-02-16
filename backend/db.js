const { Mongoose, default: mongoose, mongo } = require("mongoose");
require('dotenv').config()
mongoose.connect(process.env.MONGO_CRED)

const userSchema = new mongoose.Schema({
    username: {
        type:String,
        required:true,
        unique: true,
        minLength:3,
        trim: true
    },
    password: {
        type:String,
        required:true,
        minLength:6,
    },
    firstName: {
        type:String,
        required:true,
        minLength:30,
        match: [/^[A-Za-z]+$/, 'Only letters are allowed']
    },
    lastName: {
        type:String,
        required:true,
        minLength:30,
        match: [/^[A-Za-z]+$/, 'Only letters are allowed']
    }
})

/*
* Amount Balance = Warning How To Store in DB
* In the real world, you shouldn’t store `floats` for balances in the database.
* You usually store an integer which represents the INR value with
* decimal places (for eg, if someone has 33.33 rs in their account,
* you store 3333 in the database).
*
*
* There is a certain precision that you need to support (which for india is
* 2/4 decimal places) and this allows you to get rid of precision
* errors by storing integers in your DB
*/

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to User model - cannot add account data if user dne
        required: true
    },
    balance: {
        type: Number,
        required: true,
        min: 0
    }
})

const User = mongoose.model("User", userSchema)
const Account = mongoose.model("Account", accountSchema)

module.exports = {
    User, Account
}
