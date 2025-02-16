const express = require("express")
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./config");

const authMiddleware = function (req, res, next) {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(411).json({message:"Unauthorized"})
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        if(decoded.userId) {
            req.userId = decoded.userId
            next()
        }

    } catch (error) {
        return res.status(403).json({message:"403"})
    }

}

module.exports = authMiddleware