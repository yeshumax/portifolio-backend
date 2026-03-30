"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
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
        const conn = await mongoose_1.default.connect(mongoUri);
        console.log(`✅ MongoDB Connected Successfully!`);
    }
    catch (error) {
        console.error(`❌ Database connection error: ${error.message}`);
        throw error;
    }
};
exports.default = connectDB;
