const mongoose =require("mongoose");

const connectDB = async () =>{
     //console.log("MONGO_URI:", process.env.MONGO_URI);
    try{
        await mongoose.connect(process.env.MONGO_URI,{});
        console.log("MongoDB connected");
    }
    catch(err){
        console.log("Error connecting to MongoDB",err);
        process.exit(1);
    }
}

module.exports = connectDB;