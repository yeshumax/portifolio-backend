"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const skillSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    level: {
        type: Number,
        required: true,
        default: 0,
    },
    category: {
        type: String,
        required: true,
        enum: ['frontend', 'backend', 'design', 'tools'],
        default: 'frontend',
    },
    years: {
        type: Number,
        required: true,
        default: 0,
    },
    color: {
        type: String,
        required: true,
        default: 'bg-blue-500',
    },
}, {
    timestamps: true,
});
const Skill = mongoose_1.default.model('Skill', skillSchema);
exports.default = Skill;
