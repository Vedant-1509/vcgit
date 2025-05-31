const express=require("express")
const repoController = require("../controllers/repocontroller.js")
const repoRoute = express.Router()

repoRoute.post("/repo/create",repoController.createRepository)
repoRoute.get("/repo/all",repoController.getAllRepositories)
repoRoute.get("/repo/:id",repoController.fetchRepositoryById)
repoRoute.get("/repo/name/:name",repoController.fetchRepositoryByName)
repoRoute.get("/repo/user/:userID",repoController.fetchRepositoriesForCurrentUser)
repoRoute.put("/repo/update/:id",repoController.updateRepositoryById)
repoRoute.delete("/repo/delete/:id",repoController.deleteRepositoryById)
repoRoute.patch("/repo/toggle/:id",repoController.toggleVisibilityById)

module.exports = repoRoute;