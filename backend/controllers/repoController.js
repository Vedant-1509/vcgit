const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();

const uri = process.env.MONGODB_URI;
let client;

async function connectClient() {
  if (!client) {
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
  }
}

// async function createRepository(req, res) {
//   const { owner, name, issues = [], content = [], description, visibility } = req.body;

//   try {
//     if (!name) {
//       return res.status(400).json({ error: "Repository name is required!" });
//     }

//     if (!ObjectId.isValid(owner)) {
//       return res.status(400).json({ error: "Invalid User ID!" });
//     }

//     await connectClient();
//     const db = client.db("cluster0");
//     const repoCollection = db.collection("repositories");

//     const newRepo = {
//       owner: new ObjectId(owner),
//       name,
//       issues: issues.map(id => new ObjectId(id)),
//       content,
//       description,
//       visibility,
//     };

//     const result = await repoCollection.insertOne(newRepo);

//     res.status(201).json({
//       message: "Repository created!",
//       repositoryID: result.insertedId,
//     });
//   } catch (err) {
//     console.error("Error during repository creation:", err.message);
//     res.status(500).send("Server error");
//   }
// }



async function createRepository(req, res) {
  const { owner, name, issues = [],commits=[], content = [], description, visibility } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ error: "Repository name is required!" });
    }

    if (!ObjectId.isValid(owner)) {
      return res.status(400).json({ error: "Invalid User ID!" });
    }

    await connectClient();
    const db = client.db("cluster0");
    const repoCollection = db.collection("repositories");
    const userCollection = db.collection("users");
    const existingRepo = await repoCollection.findOne({ name, owner: new ObjectId(owner) });
    if (existingRepo) {
      return res.status(400).json({ error: "Repository already exists!" });
    }

    const newRepo = {
      owner: new ObjectId(owner),
      name,
      issues: issues.map(id => new ObjectId(id)),       // Link to Issues collection
      commits: commits.map(id => new ObjectId(id)),     // Link to Commits collection
      content,
      description,
      visibility,
      createdAt: new Date(),
    };


    

    const result = await repoCollection.insertOne(newRepo);
    const newRepoId = result.insertedId;

    // 2. Update the user to include this repo in their repositories array
    await userCollection.updateOne(
      { _id: new ObjectId(owner) },
      { $push: { repositories: newRepoId } }
    );

    res.status(201).json({
      message: "Repository created!",
      repositoryID: newRepoId,
    });

  } catch (err) {
    console.error("Error during repository creation:", err.message);
    res.status(500).send("Server error");
  }
}


async function getAllRepositories(req, res) {
  try {
    await connectClient();
    const db = client.db("cluster0");
    const repoCollection = db.collection("repositories");

    const repositories = await repoCollection.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "ownerDetails",
        },
      },
      {
        $lookup: {
          from: "issues",
          localField: "issues",
          foreignField: "_id",
          as: "issueDetails",
        },
      },
    ]).toArray();

    res.json(repositories);
  } catch (err) {
    console.error("Error fetching repositories:", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchRepositoryById(req, res) {
  const { id } = req.params;

  try {
    await connectClient();
    const db = client.db("cluster0");

    const repository = await db.collection("repositories").aggregate([
      { $match: { _id: new ObjectId(id) } },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "ownerDetails",
        },
      },
      {
        $lookup: {
          from: "issues",
          localField: "issues",
          foreignField: "_id",
          as: "issueDetails",
        },
      },
    ]).toArray();

    res.json(repository[0] || {});
  } catch (err) {
    console.error("Error fetching repository:", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchRepositoryByName(req, res) {
  const { name } = req.params;

  try {
    await connectClient();
    const db = client.db("cluster0");

    const repository = await db.collection("repositories").aggregate([
      { $match: { name } },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "ownerDetails",
        },
      },
      {
        $lookup: {
          from: "issues",
          localField: "issues",
          foreignField: "_id",
          as: "issueDetails",
        },
      },
    ]).toArray();

    res.json(repository);
  } catch (err) {
    console.error("Error fetching repository by name:", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchRepositoriesForCurrentUser(req, res) {
  const { userID } = req.params;

  try {
    await connectClient();
    const db = client.db("cluster0");

    const repositories = await db.collection("repositories").find({
      owner: new ObjectId(userID),
    }).toArray();

    if (!repositories.length) {
      return res.status(404).json({ error: "User repositories not found!" });
    }

    res.json({ message: "Repositories found!", repositories });
  } catch (err) {
    console.error("Error fetching user repositories:", err.message);
    res.status(500).send("Server error");
  }
}

async function updateRepositoryById(req, res) {
  const { id } = req.params;
  const { content, description } = req.body;

  try {
    await connectClient();
    const db = client.db("cluster0");

    const result = await db.collection("repositories").findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $push: { content },
        $set: { description },
      },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    res.json({
      message: "Repository updated successfully!",
      repository: result.value,
    });
  } catch (err) {
    console.error("Error updating repository:", err.message);
    res.status(500).send("Server error");
  }
}

async function toggleVisibilityById(req, res) {
  const { id } = req.params;

  try {
    await connectClient();
    const db = client.db("cluster0");

    const repository = await db.collection("repositories").findOne({ _id: new ObjectId(id) });
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    const updatedRepo = await db.collection("repositories").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { visibility: !repository.visibility } },
      { returnDocument: "after" }
    );

    res.json({
      message: "Repository visibility toggled successfully!",
      repository: updatedRepo.value,
    });
  } catch (err) {
    console.error("Error toggling visibility:", err.message);
    res.status(500).send("Server error");
  }
}

async function deleteRepositoryById(req, res) {
  const { id } = req.params;

  try {
    await connectClient();
    const db = client.db("cluster0");

    const result = await db.collection("repositories").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    res.json({ message: "Repository deleted successfully!" });
  } catch (err) {
    console.error("Error deleting repository:", err.message);
    res.status(500).send("Server error");
  }
}

module.exports = {
  createRepository,
  getAllRepositories,
  fetchRepositoryById,
  fetchRepositoryByName,
  fetchRepositoriesForCurrentUser,
  updateRepositoryById,
  toggleVisibilityById,
  deleteRepositoryById,
};
