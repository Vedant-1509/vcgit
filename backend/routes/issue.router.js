const express=require("express")
const issueController = require("../controllers/issuecontroller.js")
const issueRoute = express.Router()

issueRoute.post("/issue/create",issueController.createIssue)
issueRoute.put("/issue/update/:id",issueController.updateIssueById)
issueRoute.delete("/issue/delete/:id",issueController.deleteIssueById)
issueRoute.get("/issue/all",issueController.getAllIssues)
issueRoute.get("/issue/:id",issueController.getIssueById)


module.exports = issueRoute;