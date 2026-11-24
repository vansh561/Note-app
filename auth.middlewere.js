const jwt = require("jsonwebtoken");

const auth = (req,res,next)=>{
    const authHeader = req.headers.authorization;
    if (!authHeader){
        return res.status(401).send({msg: "Please login first, No token provided"});
    }
    
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).send({ msg: "Invalid Token Format" });
    }
     try {
        const decoded = jwt.verify(token, "coding");
        if (decoded){
            req.userID = decoded.userID;
            next();
        }
        else{
            res.status(401).send({ msg: "Authentication Failed" });
        }
     } catch (error) {
        res.status(401).send({ msg: "Invalid or Expired Token", error: error.message });
     }
};

module.exports = { auth };