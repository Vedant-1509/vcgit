const fs =require('fs');
const path =require("path")
const {promisify}=require("util")

const readdir=promisify(fs.readdir)
const copyFile=promisify(fs.copyFile)

async function revertRepo(commitID){
    const repoPath=path.resolve(process.cwd(),".vcgit")
    const commitsPath=path.join(repoPath,"commits")

  try {
    const commitDir = path.join(commitsPath,commitID)
    const files = await readdir(commitDir)
    const parentDir = path.resolve(repoPath,"..")

    for (const file of files) {
        await copyFile(path.join(commitDir,file),path.join(parentDir,file))
    }

    console.log(`Commit ${commitID} reverted successfully`)

  } catch (error) {
    console.log("File wasn't able to revert from S3 "+error)
  }

}
module.exports={revertRepo}


