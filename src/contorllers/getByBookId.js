const { default: mongoose } = require("mongoose");
const bookModel = require("../models/bookModel");
const reviewModel = require("../models/reviewModel");
const getBookById = async (req, res) => {
  try {
    let data = req.params.bookId;
    // console.log(data);
    if (!data)
      return res
        .status(400)
        .send({ status: false, message: "please enter the book Id " });
    if (!mongoose.Types.ObjectId.isValid(data))
      return res
        .status(400)
        .send({ status: false, message: "please enter the valid Book id" });
    let bookData = await bookModel.findById(data);
    // console.log(bookData);
    if (!bookData)
      return res.status(400).send({
        status: false,
        message: "This book id did not mathed with any book in the data base",
      });
    if (bookData.isDeleted)
      return res.status(404).send({
        status: false,
        message: "this book is deleted from the  data base",
      });
    const reviewsData = await reviewModel.find({bookId:data});
    res
      .status(200)
      .json({ status: true, data: bookData, reviewsData: reviewsData });
  } catch (e) {
    res.status(500).send({ status: false, Error: e.message });
  }
};
const deletedata = async (req, res) => {
  let deleteData = req.params.bookId;

  let bookExist = await bookModel.findById(deleteData);
  if (!deleteData)
    return res
      .status(400)
      .send({ status: false, message: "please enter the book Id " });
  if (!mongoose.Types.ObjectId.isValid(deleteData))
    return res
      .status(400)
      .send({ status: false, message: "please enter the valid Book id" });
  if (bookExist.isDeleted)
    return res
      .status(400)
      .send({ stauts: false, message: "no such book is present " });
  let bookDelete = await bookModel.findByIdAndUpdate(deleteData, {
    $set: { isDeleted: true, deletedAt: Date.now() },
  });

  // console.log(bookExist);
  res
    .status(200)
    .send({ status: true, message: "your book is deleted successfully" });
};
module.exports = { getBookById, deletedata };
