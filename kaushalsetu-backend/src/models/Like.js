import mongoose from 'mongoose';
const schema=new mongoose.Schema({userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},postId:{type:mongoose.Schema.Types.ObjectId,ref:'CommunityPost',required:true}},{timestamps:true}); schema.index({userId:1,postId:1},{unique:true}); export default mongoose.model('Like',schema);
