
const mongoose = require("mongoose");
const bookModel = require("../models/bookModel");

const updatebook = async function (req, res) {
    try {
        const data = req.body
        const bookId = req.params.bookId
        const { title, excerpt, releasedAt, ISBN } = data//Destructure

        // ----Validation----------//

        if (!data) {
            return res.status(400).send({ status: false, massage: "Please Fill the some data" })
        }
        let book = await bookModel.findById(bookId)
        if(!book){
            return res.status(400).send({status:false,message:" book is not preasent "})
        }
        //--------update only these property--------//
        if (!(title || excerpt || releasedAt || ISBN)) {
            return res.status(400).send({ status: false, massage: "This Property can't be update" })
        }
        //------already deleted---------------//
        if (book.isDeleted === true) {
            return res.status(400).send({ status: false, massage: "This Book already deleted" })
        }
        // -------successfully Update----------//
        const updatebook = await bookModel.findByIdAndUpdate(bookId, data ,{ new: true });

        return res.status(200).send({ status: true, data: updatebook })
    }
    catch (err) {
        return res.status(500).send({ status: "error", error: err.message })
    }
}
module.exports.updatebook = updatebook