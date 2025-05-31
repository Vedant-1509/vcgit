const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config.js");

async function pullRepo() {
    const repoPath = path.resolve(process.cwd(), ".vcgit");
    const commitsPath = path.join(repoPath, "commits");

    try {
        const data = await s3.listObjectsV2({
            Bucket: S3_BUCKET,   // ✅ FIXED: Bucket (not Buckets)
            Prefix: "commits/"
        }).promise();

        const objects = data.Contents;

        for (const object of objects) {
            const key = object.Key;
            const commitDir = path.join(
                commitsPath,
                path.dirname(key).split("/").pop()
            );

            await fs.mkdir(commitDir, { recursive: true });

            const params = {
                Bucket: S3_BUCKET,  // ✅ FIXED: Bucket (not Buckets)
                Key: key
            };

            const fileContent = await s3.getObject(params).promise();
            await fs.writeFile(path.join(repoPath, key), fileContent.Body);
        }

        console.log("All commits pulled successfully from S3");
    } catch (error) {
        console.log("Unable to pull the repo: " + error);
    }
}

module.exports = { pullRepo };
