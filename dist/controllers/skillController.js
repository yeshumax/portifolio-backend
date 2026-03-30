"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSkill = exports.updateSkill = exports.createSkill = exports.getSkills = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Skill_1 = __importDefault(require("../models/Skill"));
// @desc    Fetch all skills
// @route   GET /api/skills
// @access  Public
const getSkills = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        // Fetch skills from database
        const skills = await Skill_1.default.find().sort({ name: 1 });
        res.status(200).json(skills);
    }
    catch (error) {
        console.error('Error fetching skills:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch skills from database'
        });
    }
});
exports.getSkills = getSkills;
// @desc    Create a skill
// @route   POST /api/skills
// @access  Private/Admin
const createSkill = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, level, category, years, color } = req.body;
    const skill = new Skill_1.default({
        name,
        level,
        category,
        years,
        color,
    });
    const createdSkill = await skill.save();
    res.status(201).json(createdSkill);
});
exports.createSkill = createSkill;
// @desc    Update a skill
// @route   PUT /api/skills/:id
// @access  Private/Admin
const updateSkill = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, level, category, years, color } = req.body;
    const skill = await Skill_1.default.findById(req.params.id);
    if (skill) {
        skill.name = name || skill.name;
        skill.level = level !== undefined ? level : skill.level;
        skill.category = category || skill.category;
        skill.years = years !== undefined ? years : skill.years;
        skill.color = color || skill.color;
        const updatedSkill = await skill.save();
        res.status(200).json(updatedSkill);
    }
    else {
        res.status(404);
        throw new Error('Skill not found');
    }
});
exports.updateSkill = updateSkill;
// @desc    Delete a skill
// @route   DELETE /api/skills/:id
// @access  Private/Admin
const deleteSkill = (0, express_async_handler_1.default)(async (req, res) => {
    const skill = await Skill_1.default.findById(req.params.id);
    if (skill) {
        await Skill_1.default.deleteOne({ _id: skill._id });
        res.status(200).json({ message: 'Skill removed' });
    }
    else {
        res.status(404);
        throw new Error('Skill not found');
    }
});
exports.deleteSkill = deleteSkill;
