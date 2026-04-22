import jwt from "jsonwebtoken";
export const authenticateUsers=(req,res,next)=>{
    try{
        const header=req.headers.authorization;
        if(!header){
            return res.status(401).json({msg:"No token"});
        }
        const token=header.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decoded.id,
            username: decoded.username,
    };
    next();
    }
    catch(err){
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}
export const authenticateAgents=(req,res,next)=>{
    try{
        const header=req.headers.authorization;
        if(!header){
            return res.status(401).json({msg:"No token"});
        }
        const token=header.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decoded.id,
            username: decoded.username,
    };
    next();
    }
    catch(err){
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}