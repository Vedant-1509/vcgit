const mongoose = require("mongoose")
const { Schema } = mongoose;

const Repositoryschema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    content :[
        {
            type:String
        }
    ],
    visibility:{
        type:Boolean,
        default:true // true for public, false for private
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },
    issues:[{
        type: Schema.Types.ObjectId,
        ref: 'Issue'
    }]
})
const Repository = mongoose.model('Repository', Repositoryschema);
module.exports= Repository;