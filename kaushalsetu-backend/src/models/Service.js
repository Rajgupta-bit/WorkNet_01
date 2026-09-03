import mongoose from 'mongoose';
const schema=new mongoose.Schema({name:{type:String,required:true},category:String,description:String,price:{type:Number,required:true},image:String,active:{type:Boolean,default:true}},{timestamps:true}); export default mongoose.model('Service',schema);
