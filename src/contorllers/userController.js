const userModel=require('../models/userModel')
const validator=require('validator');
const { copyFileSync } = require('fs');

//-----validating the enum of the title---------------//
const isValidTitle = function (title) {
    return ["Mr", "Mrs", "Miss"].indexOf(title) !== -1;
  };
//------validating the body data----------------//
const isValidReqBody = function(reqBody){
    return Object.keys(reqBody).length >0
}
//---------checking the type of the params------------//
const isValid = function(value){
    if(typeof value ==='undefined'||typeof value === null) return false
    if(typeof value === 'string'&& value.trim().length ===0) return false
    return true
}

const createUser=async (req,res)=>{
    try{
        let data=req.body

        let {title,name,phone,email,password,address}=data
        let emailId=email.trim()
        console.log(emailId)
        let passwordcopy=password.trim()
      

        //.....checking the body is present or not------------//
        if(!isValidReqBody(data)) return  res.status(400).send({status:false,message:'please enter the details of the user'})
        
        //------validation of title----//
        if(!isValid(title)) return  res.status(400).send({status:false,message:'please enter the title'})
      
        if(!isValidTitle(title)) return res.status(400).send({status:false,message:'please enter the valid title'})
        //---- name validation-------------//
         if(!isValid(name))  return res.status(400).send({status:false,message:'please enter the valid name'})
        //----mobile validaiton------//
        if(!isValid(phone))  return res.status(400).send({status:false,message:'please enter the valid phone'})
        //----checking mobile number is correct format or not ----//
        if(!validator.isNumeric(phone.trim())) return res.status(400).send({status:false,message:'phone number must be only numbers'})
        if((phone.trim().length!=10))return res.status(400).send({status:false,message:'phone number must be 10 digits'})

        //----chekcing the phone number in db preveiouly exists or not -------//
        let numberexist=await userModel.findOne({phone})
        if(numberexist) return res.status(400).send({status:false,message:`This ${phone} number  is already registerd`})

        //----------checking email is valid or not-------------.//
        if(!isValid(email))return res.status(400).send({status:false,message:'Email must be present'})
        if(!validator.isEmail(emailId)) return res.status(400).send({status:false,message:`${emailId} is not valid`})
         //-----checking email is regiterd already ------------//
        let emailexist=await userModel.find({email:emailId})
        console.log(emailexist.length)
        if(emailexist.length!=0) return res.status(400).send({status:false,message:`This ${emailId} email  is already registerd`})

        //----password validation  ----------------//
        if(!isValid(password))  return res.status(400).send({status:false,message:"This passord is not present"})

        //--------------chekcing the lenght of the password----//
        if(!(passwordcopy.length>=8) && (passwordcopy.length<=15))  return res.status(400).send({status:false,message:"This passord length must in between 8 to 15 letters"})
        //--------------checking the adress is proper format or not--------//
        if(!isValid(address))  return res.status(400).send({status:false,message:"This enter the address"})
        if(!validator.isNumeric(address.pincode))  return res.status(400).send({status:false,message:"This entered pincode should be number"})

     
        let userdata=await userModel.create(data)
        res.status(201).send({status:true,message:data})


    }
    catch(e){
        res.status(500).send({status:false,error:e.message})
    }
}
module.exports.createUser=createUser