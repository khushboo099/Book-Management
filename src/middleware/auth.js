const jwt = require('jsonwebtoken');
const bookModel = require('../models/bookModel');
const { default: mongoose } = require("mongoose")
const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

const authentication = async (req, res, next) => {
    try {
        let token = req.headers['X-API-KEY'];
        if (!token) token = req.headers['x-api-key'];
        if (!token) return res.status(401).send({ status: false, msg: "token is missing" })

        let decodeToken = jwt.verify(token, "group@50//project@bookmanagement//")
        let todayDate = Math.floor(Date.now() / 1000)
        if (decodeToken.exp < todayDate) return res.status(401).send({ status: false, msg: "token expired, please login again" })
        next()
    } catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
}
const authorization = async (res, req, next) => {
    try {
        let token = req.headers['X-API-KEY'];
        if (!token) token = req.headers['x-api-key'];
        let data = req.params.bookId
        if (!data) return res.status(400).send({ status: false, msg: "provide bookId" })
        if (!isValidObjectId(data)) return res.status(400).send({ status: false, msg: `${data} invalid bookId` })
        let bookDetails = await bookModel.findById(data)
        if(!bookDetails) return res.status(404).send({ status: false, msg:` can not find book with this id-${data}`})
        let decodeToken = jwt.verify(token, "group@50//project@bookmanagement//")

        if (bookDetails.userId.toString() === decodeToken.userId) {
            next()
        } else {
            res.status(401).send({status: false, msg: "You are not authorized"})
        }
    } catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
}
module.exports = {
    authentication,
    authorization
}