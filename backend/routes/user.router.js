const express=require("express")
const userController = require("../controllers/usercontroller.js")
const userRoute = express.Router()

userRoute.get("/allUser",userController.getAllUsers)
userRoute.get("/getUserProfile/:id",userController.getUserProfile)
userRoute.post("/signup",userController.signup)
userRoute.post("/login",userController.login)
userRoute.put("/updateProfile/:id",userController.updateUserProfile)
userRoute.delete("/deleteProfile/:id",userController.deleteUserProfile)

module.exports = userRoute;