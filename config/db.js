import mongoose from 'mongoose';


const connectDB = async (MONGO_URI) => {
 try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
 } catch (error) {
    console.log(error)
 }
};

export default connectDB;
