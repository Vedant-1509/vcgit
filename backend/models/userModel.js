const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  repositories: [
    {
      type: Schema.Types.ObjectId,
      ref: "Repository"
    }
  ],
  followedUsers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  starRepos: [
    {
      type: Schema.Types.ObjectId,
      ref: "Repository"
    }
  ]
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
