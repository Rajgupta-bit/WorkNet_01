import mongoose from 'mongoose';
const userSchema=new mongoose.Schema({name:{type:String,required:true,trim:true},email:{type:String,required:true,unique:true,lowercase:true},phone:String,password:{type:String,required:true},role:{type:String,enum:['CUSTOMER','PROVIDER','ADMIN'],default:'CUSTOMER'},avatar:String,location:{lat:Number,lng:Number,address:String}},{timestamps:true});
export default mongoose.model('User',userSchema);
