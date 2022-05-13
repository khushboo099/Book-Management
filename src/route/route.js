const express=require("express")
const router=express.Router()
const userController=require('../contorllers/userController')
const bookController=require("../contorllers/bookControllers")
const getByBook = require("../contorllers/getByBookId")
const updateController = require("../contorllers/updateControllers")
const reviewController = require("../contorllers/reviewUpdate")
const middleware = require("../middleware/auth")
//-------------------user api-----------------------//
router.post('/register',userController.createUser)
router.post('/login',userController.loginUser)
//------------------Book apis-----------------------//
router.post('/books',middleware.authentication,middleware.authorization,bookController.bookCreation)
router.get('/books',middleware.authentication,bookController.getAllBooks)
router.get('/books/:bookId',middleware.authentication,getByBook.getBookById)
router.delete('/books/:bookId',middleware.authentication,middleware.authorization,getByBook.deletedata)
router.put('/books/:bookId',middleware.authentication,middleware.authorization,updateController.updatebook)
//------------------review apis--------------------//
router.post("/books/:bookId/review",middleware.bookCheck,reviewController.reviews)
router.put("/books/:bookId/review/:reviewId",middleware.bookCheck,reviewController.updateReview)
router.delete("/books/:bookId/review/:reviewId",middleware.bookCheck,reviewController.deleteReview)
module.exports=router; 