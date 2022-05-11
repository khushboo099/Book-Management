const express=require("express")
const router=express.Router()
const userController=require('../contorllers/userController')
const bookController=require("../contorllers/bookControllers")

router.post('/register',userController.createUser)
router.post('/login',userController.loginUser)
router.post('/books',bookController.bookCreation)
router.get('/books',bookController.getAllBooks)

module.exports=router; 