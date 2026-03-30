import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Skill from '../models/Skill';

// @desc    Fetch all skills
// @route   GET /api/skills
// @access  Public
const getSkills = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Fetch skills from database
    const skills = await Skill.find().sort({ name: 1 });
    
    res.status(200).json(skills);
  } catch (error: any) {
    console.error('Error fetching skills:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skills from database'
    });
  }
});

// @desc    Create a skill
// @route   POST /api/skills
// @access  Private/Admin
const createSkill = asyncHandler(async (req: Request, res: Response) => {
  const { name, level, category, years, color } = req.body;

  const skill = new Skill({
    name,
    level,
    category,
    years,
    color,
  });

  const createdSkill = await skill.save();
  res.status(201).json(createdSkill);
});

// @desc    Update a skill
// @route   PUT /api/skills/:id
// @access  Private/Admin
const updateSkill = asyncHandler(async (req: Request, res: Response) => {
  const { name, level, category, years, color } = req.body;
  const skill = await Skill.findById(req.params.id);

  if (skill) {
    skill.name = name || skill.name;
    skill.level = level !== undefined ? level : skill.level;
    skill.category = category || skill.category;
    skill.years = years !== undefined ? years : skill.years;
    skill.color = color || skill.color;

    const updatedSkill = await skill.save();
    res.status(200).json(updatedSkill);
  } else {
    res.status(404);
    throw new Error('Skill not found');
  }
});

// @desc    Delete a skill
// @route   DELETE /api/skills/:id
// @access  Private/Admin
const deleteSkill = asyncHandler(async (req: Request, res: Response) => {
  const skill = await Skill.findById(req.params.id);

  if (skill) {
    await Skill.deleteOne({ _id: skill._id });
    res.status(200).json({ message: 'Skill removed' });
  } else {
    res.status(404);
    throw new Error('Skill not found');
  }
});

export { getSkills, createSkill, updateSkill, deleteSkill };
