// cli/login.js
const fs = require("fs").promises;
const path = require("path");
const axios = require("axios");
const readlineSync = require("readline-sync");
const BACKEND_URL = "http://localhost:3000"; // adjust if needed

const sessionPath = path.resolve(".vcgit", "session.json");

async function login() {
  const email = readlineSync.question("Enter your email: ");
  const password = readlineSync.question("Password: ", { hideEchoBack: true });

  try {
    const res = await axios.post(`${BACKEND_URL}/login`, {
      email,
      password,
    });

    const { token, user } = res.data;

    await fs.mkdir(".vcgit", { recursive: true });
    await fs.writeFile(
      sessionPath,
      JSON.stringify(
        { token, username: user.username, userId: user._id },
        null,
        2
      )
    );

    console.log("✅ Logged in successfully!");
  } catch (error) {
    console.error(
      "❌ Login failed:",
      error.response?.data?.message || error.message
    );
  }
}

module.exports = { login };
