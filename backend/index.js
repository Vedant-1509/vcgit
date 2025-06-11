const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const http = require('http')
const { Server } = require('socket.io')
dotenv.config()

const yargs = require("yargs")
const { hideBin } = require("yargs/helpers")
const { initRepo } = require("./controllers/init.js")
const { addRepo } = require("./controllers/add.js")
const { commitRepo } = require("./controllers/commit.js")
const { pushRepo } = require("./controllers/push.js")
const { pullRepo } = require("./controllers/pull.js")
const { revertRepo } = require("./controllers/revert.js")
const { login } = require("./controllers/login.js")
const { setupstream } = require("./controllers/setupstream.js")
const mainRouter = require("./routes/main.router.js")



yargs(hideBin(process.argv))
    .command("start", "starting the server", {}, startServer)
    .command("init", "Intializing a new repository", {}, initRepo)

    .command("add <file>", "Adding file repository", (yargs) => {
        yargs.positional("file", {
            describe: "file to add to the statging area",
            type: "string",
        })
    },
        (argv) => {
            addRepo(argv.file)
        })

    .command("commit <message>", "Committing the added file", (yargs) => {
        yargs.positional("message", {
            describe: "Commit message",
            type: "string",
        })
    }, commitRepo)

    .command("push", "Push commits to S3", {}, pushRepo)

    .command("pull", "Pull commits from S3", {}, pullRepo)

    .command("revert <commitID>", "Reverting the commit", (yargs) => {
        yargs.positional("commitID", {
            describe: "Commit Id to revert to",
            type: "string",
        })
    }, (argv) => {
        revertRepo(argv.commitID);
    })



    //command for login
    .command("login", "Log in to VCGit", {}, login)

    //command to genrate upstream
    .command(
        "set-upstream",
        "Set upstream for a repository",
        (yargs) => {
            return yargs.option("repo", {
                alias: "r",
                type: "string",
                describe: "Repository name",
                demandOption: true,
            });
        },
        async (argv) => {
            await setupstream(argv.repo);
        }
    )


    .demandCommand(1, "You need atleast one command")
    .help().argv

function startServer() {
    console.log("Server logic initiated")

    const app = express()
    const port = process.env.PORT || 3000

    app.use(bodyParser.json())
    app.use(express.json())

    //mongoDB connection
    const mongoURI = process.env.MONGODB_URI
    mongoose.connect(mongoURI)
        .then(() => console.log("MongoDB connected !"))
        .catch((err) => console.log("here is the connection error with MongoDB " + err))

    app.use(cors({ origin: "*" }))
    app.use("/", mainRouter)

    //created the httpserver which further used for IO operations
    const httpServer = http.createServer(app)
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],

        }
    })
    io.on("connection", (socket) => {
        socket.on("joinRoot", (userID) => {
            user = userID
            console.log("========")
            console.log(user)
            console.log("========")
        })
    })

    //connecting the DB
    const db = mongoose.connection
    //2. What does db.once("open", callback) do?
    // This sets up an event listener for the "open" event.
    // The "open" event is triggered once when the MongoDB connection is successfully established
    // The callback (async () => { ... }) runs only one time when the connection is ready.
    db.once("open", async () => {
        console.log("Database connected")
    })

    httpServer.listen(port, () => {
        console.log("Server is running on port " + port)
    })

}