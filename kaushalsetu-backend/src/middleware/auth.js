import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export async function protect(req,res,next){
  try{
    const header=req.headers.authorization||'';
    if(!header.startsWith('Bearer ')) return res.status(401).json({message:'Authentication required'});
    const decoded=jwt.verify(header.slice(7),process.env.JWT_SECRET);
    req.user=await User.findById(decoded.id).select('-password');
    if(!req.user) return res.status(401).json({message:'User not found'});
    next();
  }catch(e){res.status(401).json({message:'Invalid or expired token'});}
}
export const roles=(...allowed)=>(req,res,next)=>allowed.includes(req.user.role)?next():res.status(403).json({message:'Forbidden'});
