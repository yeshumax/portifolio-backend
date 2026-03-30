import mongoose from 'mongoose';
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            Object.keys(process.env).forEach(key => {
                if (key.toLowerCase().includes('mongodb')) {
                    console.error(`   ${key}=${process.env[key]?.substring(0, 30)}...`);
                }
            });
            process.exit(1);
        }
        const maskedUri = mongoUri.replace(/mongodb(\+srv)?:\/\/([^:]+):[^@]+@/, 'mongodb$1://***:***@');
        const conn = await mongoose.connect(mongoUri);
        console.log(`✅ MongoDB Connected Successfully!`);
    }
    catch (error) {
        console.error(`❌ Database connection error: ${error.message}`);
        throw error;
    }
};
export default connectDB;
