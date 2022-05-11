const userModel = require("../models/userModel");
const validator = require("validator");
const jwt = require("jsonwebtoken");

//-----validating the enum of the title---------------//
const isValidTitle = function (title) {
  return ["Mr", "Mrs", "Miss"].indexOf(title) !== -1;
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

const createUser = async (req, res) => {
  try {
    let data = req.body;

    let { title, name, phone, email, password, address } = data;

    //.....checking the body is present or not------------//
    if (!isValidReqBody(data))
      return res.status(400).send({
        status: false,
        message: "please enter the details of the user",
      });

    //------validation of title----//
    if (!isValid(title))
      return res
        .status(400)
        .send({ status: false, message: "please enter the title" });

    if (!isValidTitle(title))
      return res.status(400).send({
        status: false,
        message: "title must be include only Mr ,Mrs ,Miss",
      });

    //---- name validation-------------//
    if (!isValid(name))
      return res
        .status(400)
        .send({ status: false, message: "please enter the name" });

    //----mobile validaiton------//
    if (!isValid(phone))
      return res
        .status(400)
        .send({ status: false, message: "please enter the phone number" });

    //----checking mobile number is correct format or not ----//
    if (!validator.isNumeric(phone.trim()))
      return res
        .status(400)
        .send({ status: false, message: "phone number must be only numbers" });

    if (phone.trim().length != 10)
      return res
        .status(400)
        .send({ status: false, message: "phone number must be 10 digits" });

    //----chekcing the phone number in db preveiouly exists or not -------//
    let numberexist = await userModel.findOne({ phone });

    if (numberexist)
      return res.status(409).send({
        status: false,
        message: `This ${phone} number  is already registered`,
      });

    //----------checking email is valid or not-------------.//
    if (!isValid(email))
      return res
        .status(400)
        .send({ status: false, message: "Email must be present" });

    if (!validator.isEmail(email))
      return res
        .status(400)
        .send({ status: false, message: `${email} email is not valid` });

    //-----checking email is regiterd already ------------//
    let emailexist = await userModel.find({ email: email });
    // console.log(emailexist.length)
    if (emailexist.length != 0)
      return res.status(409).send({
        status: false,
        message: `This ${email} email  is already registerd`,
      });

    //----password validation  ----------------//
    if (!isValid(password))
      return res
        .status(400)
        .send({ status: false, message: "This password is not present" });

    //--------------chekcing the lenght of the password----//
    if (!(password.length >= 8) && password.length <= 15)
      return res.status(400).send({
        status: false,
        message: "The password length must in between 8 to 15 letters",
      });

    //--------------checking the address is proper format or not--------//
   if (address.pincode){
    //  console.log(address.pincode.length)
     if(!((address.pincode.trim().length) == 6)) return res.status(400).send({status:false,message:"pincode length must be 6 digits"})
    if (!validator.isNumeric(address.pincode))
      return res.status(400).send({
        status: false,
        message: "The entered pincode should be number",
      });
    }

    let userdata = await userModel.create(data);
    res.status(201).send({
      status: true,
      message: "user created successfully",
      data: userdata,
    });
  } catch (e) {
    res.status(500).send({ status: false, error: e.message });
  }
};


const loginUser = async (req, res) => {
 try{ let { email, password } = req.body;

  if (!isValidReqBody(req.body))
    return res
      .status(400)
      .send({ status: false, message: "please enter login credentials" });
  //-------------email validation---------------//
  if (!isValid(email))
    return res
      .status(400)
      .send({ status: false, message: "please enter the email" });
  if (!validator.isEmail(email))
    return res
      .status(400)
      .send({ status: false, message: `${email} email is not valid` });

  let userExist = await userModel.findOne({ email });
  if (!userExist)
    return res
      .status(401)
      .send({ status: false, message: "this email is not registered" });
  //------------pasword validation------------//
  if (!isValid(password))
    return res
      .status(400)
      .send({ status: false, message: "This password is not present" });
  if (!(password.length >= 8) && password.length <= 15)
    return res.status(400).send({
      status: false,
      message: "The password length must in between 8 to 15 letters",
    });
  let passwordValid = await userModel.findOne({ password });
  if (!passwordValid)
    return res
      .status(401)
      .send({
        status: false,
        message: "this password is not matching with your email id",
      });
  let token = jwt.sign(
    {
      userId: userExist._id.toString(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 60,
    },
    "group@50//project@bookmanagement//"
  );
  res.setHeader("x-api-key", token);
  res.status(201).send({ status: true, token: token });
}catch (err) {
  res.status(500).send({ status: false, error: err.message });
}
};

module.exports = {
  createUser,
  loginUser,
};
