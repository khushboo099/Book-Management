const bookModel = require("../models/bookModel");
const userModel = require("../models/userModel");
const mongoose = require("mongoose");
const Validator = require("validator");
const moment = require("moment");
const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId);
};

//------validating the body data----------------//
const isValidReqBody = function (reqBody) {
    return Object.keys(reqBody).length > 0;
};
//---------checking the type of the params------------//
const isValid = function (value) {
    if (typeof value === "undefined" || typeof value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};
const bookCreation = async function (req, res) {
    try {
        let data = req.body;
        const { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = data;
        //.....checking the body is present or not------------//
        if (!isValidReqBody(data))
            return res
                .status(400)
                .send({
                    status: false,
                    message: "please enter the details of the book",
                });
        //------validation of title----//
        if (!isValid(title))
            return res
                .status(400)
                .send({ status: false, message: "please enter the title" });

        let findTitle = await bookModel.findOne({ title })
        if (findTitle)
            return res
                .status(400)
                .send({ status: false, message: "with this title book is already exist" });
        // ------validation of Excerpt--------//
        if (!isValid(excerpt))
            return res
                .status(400)
                .send({ status: false, message: "please enter the excerpt" });
        // -------validation of userId-------//
        if (!isValid(userId))
            return res
                .status(400)
                .send({ status: false, message: "please enter the userId" });
        //-----validation of userId-----------//
        if (!isValidObjectId(userId))
            return res.status(400).send({ status: false, message: "invalid UserId" });

        if (!isValid(ISBN))
            return res
                .status(400)
                .send({ status: false, message: "please enter ISBN " });
        if (!Validator.isISBN(ISBN))
            return res.status(400).send({ status: false, message: "invalid ISBN" });
        // if (!findUser) return res.status(404).send({ status: false, message: "User  is not present with userId" });
        let findISBN = await bookModel.findOne({ ISBN });
        // console.log(findISBN);
        if (findISBN)
            return res
                .status(400)
                .send({
                    status: false,
                    message: "ISBN already exist with another book",
                });
        if (!category)
            return res
                .status(400)
                .send({ status: false, message: "please enter the category" });
        if (!subcategory)
            return res
                .status(400)
                .send({ status: false, message: "please enter the subcategory" });
        let findUser = await userModel.findById(userId);
        if (!findUser)
            return res
                .status(404)
                .send({ status: false, message: "User  is not present with userId" });
        // console.log(findUser);
        if (!releasedAt)
            return res
                .status(400)
                .send({ status: false, message: "please enter release time" });

        if (!Validator.isDate(releasedAt))
            return res
                .status(400)
                .send({ status: false, message: "please enter release time in this format(YYYY-MM-DD)" });

        const creatbook = await bookModel.create(data);
        return res
            .status(201)
            .send({
                status: true,
                message: "Book created successfully",
                data: creatbook,
            });
    } catch (err) {
        return res.status(500).send({ status: false, error: err.message });
    }
}

        // ------Get All Books--------//
 const getAllBooks = async function (req, res) {
            try {
         let queryParams = req.query;

                //--------validation of userId------//
                if (queryParams.userId) {
                    if (!isValidObjectId(queryParams.userId))
                        return res
                            .status(400)
                            .send({ status: false, message: "Invalid userId" });
                }

                const booksData = await bookModel
                    .find({ isDeleted: false, ...queryParams })
                    .select({
                        ISBN: 0,
                        isDeleted: 0,
                        updatedAt: 0,
                        createdAt: 0,
                        __v: 0,
                    });

                if (booksData.length === 0)
                    return res.status(404).send({ status: false, message: "No books found" });

                const sortedBooks = booksData.sort((a, b) =>
                    a.title.localeCompare(b.title)
                );
                res.status(200).send({ status: true, data: sortedBooks });

            } catch (err) {
                return res.status(500).send({ status: false, error: err.message });
            }
        };

module.exports = {
    bookCreation,
    getAllBooks
};
