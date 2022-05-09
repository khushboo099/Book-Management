const express=require("express")
const router=express.Router()
const userController=require('../contorllers/userController')
router.post('/register',userController.createUser)
module.exports=router;