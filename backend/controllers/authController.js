const User = require("../models/User");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");

const generateToken = (userId) =>{
    return jwt.sign({id:userId},process.env.JWT_SECRET,{expiresIn:"7d"});
}

const registerUser = async(req,res)=>{
    try{
        const {name,email,password,profileImageUrl}=req.body;

        const userExists=await User.findOne({email});
        if(userExists){
            return res.status(400).json({message: "User already exists"});
        }

        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);

        const user=await User.create({
            name,
            email,
            password:hashedPassword,
            profileImageUrl,
        });
      
        res.status(201).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            profileImageUrl:user.profileImageUrl,
            token:generateToken(user._id),
        })
    }
    catch(error){
        res.status(500).json({message:"Server error",error:error.message})
    }
}
const updateSocialLinks = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming `req.user` from auth middleware
    const { linkedin, github, leetcode, hackerrank, skillrack, portfolio } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { linkedin, github, leetcode, hackerrank, skillrack, portfolio },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
const loginUser = async(req,res)=>{
    try{
        const{ email,password } = req.body;

        const user = await User.findOne({email});
        if(!user){
            return res.status(500).json({message:"Invalid email or password"});
        }

        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(500).json({message:"Invalid email or password"});
        }

        res.json({
            _id:user._id,
            name:user.name,
            email:user.email,
            profileImageUrl:user.profileImageUrl,
            token:generateToken(user._id),
        })

    }catch(error){
        res.status(500).json({message:"Server error",error:error.message})
    }
}

const getUserProfile = async(req,res)=>{
     try{
        const user=await User.findById(req.user.id).select("-password");
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        res.json(user);
    }catch(error){
        res.status(500).json({message:"Server error",error:error.message})
    }
}

module.exports = {registerUser, loginUser, getUserProfile,updateSocialLinks};