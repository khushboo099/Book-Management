const bookModel = require("../models/bookModel");
const userModel = require("../models/userModel");
const reviewModel = require("../models/reviewModel")
const mongoose = require("mongoose");
const Validator = require("validator");
const aws = require("aws-sdk")



const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId);
};

//--------------validating the body data----------------//
const isValidReqBody = function (reqBody) {
    return Object.keys(reqBody).length > 0;
};
//---------checking the type of the params------------//
const isValid = function (value) {
    if (typeof value === "undefined" || typeof value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};

// s3 and cloud stodare
//  step1: multer will be used to get access to the file in nodejs( from previous session learnings)
//  step2:[BEST PRACTISE]:- always write s2 upload function separately- in a separate file/function..exptect it to take file as input and return the uploaded file as output
// step3: aws-sdk install - as package
// step4: Setupconfig for aws authenticcation- use code below as plugin keys that are given to you
//  step5: build the uploadFile funciton for uploading file- use code below and edit what is marked HERE only


//PROMISES:-
// -you can never use await on callback..if you awaited something , then you can be sure it is within a promise
// -how to write promise:- wrap your entire code inside: "return new Promise( function(resolve, reject) { "...and when error - return reject( err )..else when all ok and you have data, return resolve (data)

aws.config.update({
    accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
        // this function will upload file to aws and return the link
        let s3 = new aws.S3({ apiVersion: '2006-03-01' }); // we will be using the s3 service of aws

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",  //HERE
            Key: "abc/" + file.originalname, //HERE 
            Body: file.buffer
        }


        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }
            console.log(data)
            console.log("file uploaded succesfully")
            return resolve(data.Location)
        })

        // let data= await s3.upload( uploadParams)
        // if( data) return data.Location
        // else return "there is an error"

    })
}


//----------------------------BOOK CREATION-----------------------//
const bookCreation = async function (req, res) {
    try {
        let data = req.body;

        const { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = data;

        //.....checking the body is present or not------------//
        if (!isValidReqBody(data))
            return res.status(400).send({ status: false, message: "please enter the details of the book", });

        //------validation of title----//
        if (!isValid(title))
            return res.status(400).send({ status: false, message: "please enter the title" });

        let findTitle = await bookModel.findOne({ title })
        if (findTitle)
            return res.status(400).send({ status: false, message: "with this title book is already exist" });

        // ------validation of Excerpt--------//
        if (!isValid(excerpt))
            return res.status(400).send({ status: false, message: "please enter the excerpt" });

        // -------validation of userId-------//
        if (!isValid(userId))
            return res.status(400).send({ status: false, message: "please enter the userId" });

        //-----validation of userId-----------//
        if (!isValidObjectId(userId))
            return res.status(400).send({ status: false, message: "invalid UserId" });

        if (!isValid(ISBN))
            return res.status(400).send({ status: false, message: "please enter ISBN " });

        if (!Validator.isISBN(ISBN))
            return res.status(400).send({ status: false, message: "invalid ISBN" });

        let findISBN = await bookModel.findOne({ ISBN });
        // console.log(findISBN);
        if (findISBN)
            return res.status(400).send({ status: false, message: "ISBN already exist with another book", });

        if (!category)
            return res.status(400).send({ status: false, message: "please enter the category" });

        if (!subcategory)
            return res.status(400).send({ status: false, message: "please enter the subcategory" });

        let findUser = await userModel.findById(userId);
        if (!findUser)
            return res.status(404).send({ status: false, message: "User is not present with userId" });
        console.log(findUser);

        if (!releasedAt)
            return res.status(400).send({ status: false, message: "please enter release time" });

        if (!Validator.isDate(releasedAt))
            return res.status(400).send({ status: false, message: "please enter release time in this format(YYYY-MM-DD)" });
        let files = req.files
        console.log(files)
        if (files && files.length > 0) {
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            var uploadedFileURL = await uploadFile(files[0])
            // res.status(201).send({ msg: "file uploaded succesfully", data: uploadedFileURL })
        }
        else {
            res.status(400).send({ msg: "No file found" })
        }

        data.bookcover = uploadedFileURL
        const createbook = await bookModel.create(data);
        return res.status(201).send({ status: true, message: "Book created successfully", data: createbook, });

    } catch (err) {
        return res.status(500).send({ status: false, error: err.message });
    }
}

//----------------------------FETCHING BOOKS-----------------------//
const getAllBooks = async function (req, res) {
    try {
        let queryParams = req.query;

        //--------validation of userId------//
        if (queryParams.userId) {
            if (!isValidObjectId(queryParams.userId))
                return res.status(400).send({ status: false, message: "Invalid userId" });
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


//----------------------------GET BOOK BY ID-----------------------//
const getBookById = async (req, res) => {
    try {
        let data = req.params.bookId;
        // console.log(data);
        if (!data)
            return res.status(400).send({ status: false, message: "please enter the book Id " });

        if (!mongoose.Types.ObjectId.isValid(data))
            return res.status(400).send({ status: false, message: "please enter the valid Book id" });

        let bookData = await bookModel.findById(data);
        // console.log(bookData);
        if (!bookData)
            return res.status(400).send({ status: false, message: "This book id did not matched with any book in the data base", });

        if (bookData.isDeleted)
            return res.status(404).send({ status: false, message: "this book is deleted from the  data base", });

        const reviewsData = await reviewModel.find({ bookId: data });
        res.status(200).json({ status: true, data: bookData, reviewsData: reviewsData });

    } catch (err) {
        res.status(500).send({ status: false, Error: err.message });
    }
};


//----------------------------UPDATE BOOK-----------------------//
const updatebook = async function (req, res) {
    try {
        const data = req.body;
        const bookId = req.params.bookId;
        const { title, excerpt, releasedAt, ISBN } = data; //Destructure

        // ----Validation----------//

        if (!data) {
            return res.status(400).send({ status: false, massage: "Please Fill the some data" });
        }

        let book = await bookModel.findById(bookId);
        if (!book) {
            return res.status(404).send({ status: false, message: " book is not present " });
        }
        //--------update only these property--------//
        if (!(title || excerpt || releasedAt || ISBN)) {
            return res.status(400).send({ status: false, message: "This Property can't be update" });
        }
        if (title) {
            let findTitle = await bookModel.findOne({ title });
            if (findTitle)
                return res.status(400).send({ status: false, message: "title is already present with another book", });
        }
        if (ISBN) {
            if (!validator.isISBN(ISBN))
                return res.status(400).send({ status: false, message: "invalid ISBN" });

            let findISBN = await bookModel.findOne({ ISBN });
            if (findISBN)
                return res.status(400).send({ status: false, message: "ISBN is already assign to another book", });
        }
        //------already deleted---------------//
        if (book.isDeleted === true) {
            return res.status(400).send({ status: false, massage: "This Book already deleted" });
        }
        // -------successfully Update----------//
        const updatebook = await bookModel.findByIdAndUpdate(bookId, data, {
            new: true,
        });

        return res.status(200).send({ status: true, data: updatebook });
    } catch (err) {
        return res.status(500).send({ status: "error", error: err.message });
    }
};

//----------------------------DELETE BOOKS-----------------------//
const deletedata = async (req, res) => {
    try {
        let deleteData = req.params.bookId;

        let bookExist = await bookModel.findById(deleteData);
        if (!deleteData)
            return res.status(400).send({ status: false, message: "please enter the book Id " });

        if (!mongoose.Types.ObjectId.isValid(deleteData))
            return res.status(400).send({ status: false, message: "please enter the valid Book id" });

        if (bookExist.isDeleted)
            return res.status(400).send({ stauts: false, message: "no such book is present " });

        let bookDelete = await bookModel.findByIdAndUpdate(deleteData, {
            $set: { isDeleted: true, deletedAt: Date.now() },
        });

        res.status(200).send({ status: true, message: "your book is deleted successfully" });

    } catch (err) {
        res.status(500).send({ status: false, Error: err.message });
    }
};


//----------------------------EXPORTING-----------------------//
module.exports = {
    bookCreation,
    getAllBooks,
    getBookById,
    deletedata,
    updatebook
};
