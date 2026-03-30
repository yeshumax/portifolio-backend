import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Explicitly load .env file with full path
const envPath = path.resolve(process.cwd(), '.env');
console.log(`📁 Looking for .env at: ${envPath}`);
console.log(`📁 File exists: ${fs.existsSync(envPath)}`);

if (fs.existsSync(envPath)) {
  console.log('📄 .env file content preview:');
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n').slice(0, 5); // Show first 5 lines
  lines.forEach(line => console.log(`   ${line}`));
}

// Load dotenv with explicit path and debug
const result = dotenv.config({ 
  path: envPath,
  debug: true 
});

if (result.error) {
  console.error('❌ Error loading .env file:', result.error);
  process.exit(1);
}

console.log('✅ .env file loaded successfully');
console.log('📋 Variables loaded:', Object.keys(result.parsed || {}).length);
console.log('📋 Keys found:', Object.keys(result.parsed || {}));

const connectDB = async (): Promise<void> => {
  try {
    console.log('🔍 Checking environment...');
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    console.log(`   Current directory: ${process.cwd()}`);
    
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI is not defined in environment variables');
      console.error('📋 All environment variables with MONGODB:');
      Object.keys(process.env).forEach(key => {
        if (key.toLowerCase().includes('mongodb')) {
          console.error(`   ${key}=${process.env[key]?.substring(0, 30)}...`);
        }
      });
      process.exit(1);
    }

    const maskedUri = mongoUri.replace(/mongodb(\+srv)?:\/\/([^:]+):[^@]+@/, 'mongodb$1://***:***@');
    console.log(`🔌 Connecting to MongoDB: ${maskedUri}`);
    
    const conn = await mongoose.connect(mongoUri);
    
    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`   🖥️  Host: ${conn.connection.host}`);
    console.log(`   📊 Database: ${conn.connection.name}`);
    console.log('🎉 Database connection verified');
    
  } catch (error: any) {
    console.error(`❌ Database connection error: ${error.message}`);
    throw error;
  }
};

export default connectDB;