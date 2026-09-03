import mongoose from 'mongoose';
const schema=new mongoose.Schema({postId:{type:mongoose.Schema.Types.ObjectId,ref:'CommunityPost',required:true},userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},text:{type:String,required:true}},{timestamps:true}); export default mongoose.model('Reply',schema);
