import dotenv from "dotenv";
dotenv.config();


const adminAuth=(req,res,next)=>{
    try {
      const token=req.header("x-admin-token") 
      
      if(!token){
        return res.status(401).json({message:"No token provided, authorization denied"})
      }

      if(token !== process.env.ADMIN_SECRET_TOKEN){
        return res.status(403).json({message:"Invalid token, access denied"})
      }
      next();
    } catch (error) {
       res.status(500).json({message:"Server error im admin auth middleware"}) 
    }
}

export default adminAuth;
