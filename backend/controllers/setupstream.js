const fs = require("fs").promises;
const path = require("path");
const axios = require("axios");
const  BACKEND_URL  ="http://localhost:3000"; // Adjust this URL as needed

const sessionPath = path.resolve(".vcgit", "session.json");
const configPath = path.resolve(".vcgit", "config.json");
async function getSession() {
  try {
    const data = await fs.readFile(sessionPath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    throw new Error("You must login first. Session not found.");
  }
}
async function setupstream(repoName) {
  try {
    const session = await getSession();
    const { token, userId } = session;

    const response = await axios.get(`${BACKEND_URL}/repo/${repoName}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const repo = response.data;

    if (!repo) {
      console.error("❌ Repository not found.");
      return;
    }

    if (repo.owner !== userId) {
      console.error("⛔ You are not the owner of this repository. Cannot set upstream.");
      return;
    }

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
