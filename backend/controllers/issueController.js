const { ObjectId } = require("mongodb");
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

async function createIssue(req, res) {
  const { title, description } = req.body;
  const { id } = req.params; // repository ID

  try {
    await connectClient();
    const db = client.db("cluster0");

    const newIssue = {
      title,
      description,
      status: "open",
      repository: new ObjectId(id),
      createdAt: new Date(),
    };

    const result = await db.collection("issues").insertOne(newIssue);

    // Also update the repository's issues array
    await db.collection("repositories").updateOne(
      { _id: new ObjectId(id) },
      { $push: { issues: result.insertedId } }
    );

    res.status(201).json({
      message: "Issue created!",
      issueID: result.insertedId,
    });
  } catch (err) {
    console.error("Error during issue creation:", err.message);
    res.status(500).send("Server error");
  }
}

async function updateIssueById(req, res) {
  const { id } = req.params;
  const { title, description, status } = req.body;

  try {
    await connectClient();
    const db = client.db("cluster0");

    const result = await db.collection("issues").findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          title,
          description,
          status,
        },
      },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    res.json({
      message: "Issue updated successfully!",
      issue: result.value,
    });
  } catch (err) {
    console.error("Error during issue update:", err.message);
    res.status(500).send("Server error");
  }
}

async function deleteIssueById(req, res) {
  const { id } = req.params;

  try {
    await connectClient();
    const db = client.db("cluster0");

    // Find the issue to get its repository
    const issue = await db.collection("issues").findOne({ _id: new ObjectId(id) });
    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    // Delete the issue
    const result = await db.collection("issues").deleteOne({ _id: new ObjectId(id) });

    // Remove reference from the repository
    await db.collection("repositories").updateOne(
      { _id: issue.repository },
      { $pull: { issues: new ObjectId(id) } }
    );

    res.json({ message: "Issue deleted successfully!" });
  } catch (err) {
    console.error("Error deleting issue:", err.message);
    res.status(500).send("Server error");
  }
}
// Function to fetch all issues for a specific repository
async function getAllIssues(req, res) {
  const { id } = req.params; // repository ID

  try {
    await connectClient();
    const db = client.db("cluster0");

    const issues = await db.collection("issues")
      .find({ repository: new ObjectId(id) })
      .toArray();
      if(!issues || issues.length === 0) {
        return res.status(404).json({ error: "No issues found for this repository!" });
      }

    res.status(200).json(issues);
  } catch (err) {
    console.error("Error fetching issues:", err.message);
    res.status(500).send("Server error");
  }
}
//finging the getIssueById function to fetch a single issue by its ID
async function getIssueById(req, res) {
  const { id } = req.params;

  try {
    await connectClient();
    const db = client.db("cluster0");

    const issue = await db.collection("issues").findOne({ _id: new ObjectId(id) });

    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    res.json(issue);
  } catch (err) {
    console.error("Error fetching issue:", err.message);
    res.status(500).send("Server error");
  }
}

module.exports = {
  createIssue,
  updateIssueById,
  deleteIssueById,
  getAllIssues,
  getIssueById,
};
