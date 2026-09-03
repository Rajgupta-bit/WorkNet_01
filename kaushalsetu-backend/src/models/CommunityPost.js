import mongoose from 'mongoose';
const schema=new mongoose.Schema({userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},text:{type:String,required:true},image:String,likesCount:{type:Number,default:0}},{timestamps:true}); export default mongoose.model('CommunityPost',schema);
