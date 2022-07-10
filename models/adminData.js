const mongoose = require('mongoose')
const Schema = mongoose.Schema


const AdminSchema = new Schema({
    email:String,
    password:String,
    created_at :{type:Date, required:true,default:Date.now}
},{timestamps:true})

const admin=mongoose.model('admin',AdminSchema)
module.exports=admin