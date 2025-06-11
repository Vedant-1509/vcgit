const fs = require("fs").promises;
const path = require("path");
const axios = require("axios");

const BACKEND_URL = "http://localhost:3000"; // Adjust if needed
const sessionPath = path.resolve(".vcgit", "session.json");
const configPath = path.resolve(".vcgit", "upstream.json");

async function getSession() {
  try {
    const data = await fs.readFile(sessionPath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    throw new Error("❌ You must login first. Session not found.");
  }
}

async function setupstream(repoName) {
  try {
    const session = await getSession();
    const { token, userId } = session;

    // Get all repositories owned by the user
    const response = await axios.get(`${BACKEND_URL}/repo/user/${userId}`);

    // const repos = response.data;

     console.log("DEBUG repos response:", response.data);

   // Extract repositories correctly from the response
    const repos = response.data.repositories;

    if (!Array.isArray(repos)) {
      throw new Error("Invalid response: Expected an array of repositories.");
    }


    // Find the repo by name
    const repo = repos.find((r) => r.name === repoName);

    if (!repo) {
      console.error("❌ Repository not found or you are not the owner.");
      return;
    }

    // Save upstream configuration
    const config = {
      upstream: {
        name: repo.name,
        repoId: repo._id,
        ownerId: repo.owner,
      },
    };

    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    console.log(`✅ Upstream set to repository: ${repo.name}`);
  } catch (err) {
    console.error("⚠️ Error setting upstream:", err.response?.data?.message || err.message);
  }
}

module.exports = { setupstream };
