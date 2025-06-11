const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config.js");

async function pushRepo() {
  const repoPath = path.resolve(process.cwd(), ".vcgit");
  const commitsPath = path.join(repoPath, "commits");
  const sessionPath = path.join(repoPath, "session.json");
  const upstreamPath = path.join(repoPath, "upstream.json");

  try {
    // Read session (to get userId)
    const sessionData = await fs.readFile(sessionPath, "utf-8");
    const { userId } = JSON.parse(sessionData);

    // Read upstream (to get repoId)
    const upstreamData = await fs.readFile(upstreamPath, "utf-8");
    const { upstream: { repoId } } = JSON.parse(upstreamData);

    const commitDirs = await fs.readdir(commitsPath);

    for (const commitDir of commitDirs) {
      const commitPath = path.join(commitsPath, commitDir);
      const files = await fs.readdir(commitPath);

      for (const file of files) {
        const filePath = path.join(commitPath, file);
        const fileContent = await fs.readFile(filePath);

        const s3Key = `${userId}/${repoId}/commits/${commitDir}/${file}`;

        const params = {
          Bucket: S3_BUCKET,
          Key: s3Key,
          Body: fileContent,
        };

        await s3.upload(params).promise();
        console.log(`✅ Uploaded: ${s3Key}`);
      }
    }

    console.log("🚀 All repo files pushed to S3 successfully!");
  } catch (error) {
    console.error("❌ Error while pushing the repository:", error.message);
  }
}

module.exports = { pushRepo };
