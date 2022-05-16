const { default: mongoose } = require("mongoose");
const bookModel = require("../models/bookModel");
const reviewModel = require("../models/reviewModel");
const validator = require("validator");

const isValidObjectId = function (ObjectId) {
  return mongoose.Types.ObjectId.isValid(ObjectId);
};
const isValid = (value) => {
  if (typeof value === "undefined" || typeof value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};
const isValidReqBody = function (reqBody) {
  return Object.keys(reqBody).length > 0;
};
const reviews = async (req, res) => {
  try {
    let data = req.params.bookId;
    // console.log(data)
    const bodyData = req.body;
    if (!isValidReqBody(bodyData))
      return res
        .status(400)
        .send({ status: false, message: `fill details about review` });
    const { reviewedBy, reviewedAt, rating, review } = bodyData;


    if (!isValid(rating))
      return res
        .status(400)
        .send({ status: false, message: `rating field is mandatory` });
    if (!(rating >= 1 && rating <= 5))
      return res
        .status(400)
        .send({ status: false, message: `please rate between 1 to 5` });
    bodyData["reviewedAt"] = Date.now();
    const finalData = { bookId: data, ...bodyData };
    const reviewofBooks = await reviewModel.create(finalData);
    await bookModel.findByIdAndUpdate(data, { $inc: { reviews: 1 } });
    res.status(201).send({ status: true, data: reviewofBooks });
  } catch (e) {
    res.status(500).send({ status: false, error: e.message });
  }
};
const updateReview = async (req, res) => {
  let data = req.body;
  if (!isValidReqBody(data))
    return res
      .status(400)
      .send({ status: false, message: `fill some details` });
  let { reviewedBy, rating, review } = data;
  let bookId = req.params.bookId;
  // console.log(bookId)
  let reviewId = req.params.reviewId;
  if (!isValid(reviewId))
  return res
    .status(400)
    .send({ status: false, message: `reviewedBy field is mandatory` });
  
  const reviews = await reviewModel.findById(reviewId);
  // console.log(reviews.bookId)
  if (reviews.bookId.toString() !== bookId)
    return res
      .status(400)
      .send({
        status: false,
        msg: `your review's bookId is not match with your given bookId`,
      });
  if (!reviews || reviews.isDeleted)
    return res
      .status(404)
      .send({ status: false, msg: `review is not present in the data base` });
  if (!isValidObjectId(reviewId))
    return res
      .status(400)
      .send({ status: false, message: `the reviewId ${reviewId} not  valid ` });
  if (!validator.isNumeric(rating.toString()))
    return res
      .status(400)
      .send({ status: false, message: `please enter number in rating` });
  if (!(rating >= 1 && rating <= 5))
    return res
      .status(400)
      .send({ status: false, message: `please rate between 1 to 5` });
  let updateReview = await reviewModel.findByIdAndUpdate(reviewId, data, {
    new: true,
  });
  res
    .status(200)
    .send({ status: true, msg: "update successfull", data: updateReview });
};
const deleteReview = async (req, res) => {
  let bookId = req.params.bookId;
  // console.log(bookId)

  let reviewId = req.params.reviewId;
  if (!isValid(reviewId))
  return res
    .status(400)
    .send({ status: false, message: `reviewedBy field is mandatory` });
  const reviews = await reviewModel.findById(reviewId);
  // console.log(reviews.bookId)
  if (reviews.bookId.toString() !== bookId)
    return res
      .status(400)
      .send({
        status: false,
        msg: `your review's bookId is not match with your given bookId`,
      });
  if (!reviews || reviews.isDeleted)
    return res
      .status(404)
      .send({ status: false, msg: `review is not present in the data base` });
  if (!isValidObjectId(reviewId))
    return res
      .status(400)
      .send({ status: false, message: `the reviewId ${reviewId} not  valid ` });

  await reviewModel.findByIdAndUpdate(
    reviewId,
    {
      $set: {
        isDeleted: true,
        deletedAt: Date.now(),
      },
    },
    { upsert: true }
  );
  await bookModel.findByIdAndUpdate(bookId, { $inc: { reviews: -1 } });
  res.status(200).send({ status: true, msg: "review is deleted successfull" });
};
module.exports = {
  reviews,
  updateReview,
  deleteReview,
};
