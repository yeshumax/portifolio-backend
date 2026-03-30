import asyncHandler from 'express-async-handler';
import Project from '../models/Project';
const getProjects = asyncHandler(async (req, res) => {
    try {
        // Fetch projects from database
        const projects = await Project.find().sort({ createdAt: -1 });
        res.status(200).json(projects);
    }
    catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch projects from database'
        });
    }
});
const createProject = asyncHandler(async (req, res) => {
    const { title, description, techStack, githubLink, liveLink, type } = req.body;
    // Handle image from file upload or fallback to URL
    const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;
    if (!image) {
        res.status(400);
        throw new Error('Project image is required');
    }
    // Handle techStack which might be a JSON string from FormData
    let techStackArray = techStack;
    if (typeof techStack === 'string') {
        try {
            techStackArray = JSON.parse(techStack);
        }
        catch (e) {
            techStackArray = techStack.split(',').map((s) => s.trim());
        }
    }
    const project = new Project({
        title,
        description,
        techStack: techStackArray,
        githubLink,
        liveLink,
        image,
        type,
    });
    const createdProject = await project.save();
    res.status(201).json(createdProject);
});
const updateProject = asyncHandler(async (req, res) => {
    const { title, description, techStack, githubLink, liveLink, image, type } = req.body;
    const project = await Project.findById(req.params.id);
    if (project) {
        // Handle techStack which might be a JSON string from FormData
        let techStackArray = techStack || project.techStack;
        if (typeof techStack === 'string') {
            try {
                techStackArray = JSON.parse(techStack);
            }
            catch (e) {
                techStackArray = techStack.split(',').map((s) => s.trim());
            }
        }
        project.title = title || project.title;
        project.description = description || project.description;
        project.techStack = techStackArray;
        project.githubLink = githubLink || project.githubLink;
        project.liveLink = liveLink || project.liveLink;
        project.image = req.file ? `/uploads/${req.file.filename}` : (image || project.image);
        project.type = type || project.type;
        const updatedProject = await project.save();
        res.status(200).json(updatedProject);
    }
    else {
        res.status(404);
        throw new Error('Project not found');
    }
});
const deleteProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);
    if (project) {
        await Project.deleteOne({ _id: project._id });
        res.status(200).json({ message: 'Project removed' });
    }
    else {
        res.status(404);
        throw new Error('Project not found');
    }
});
export { getProjects, createProject, updateProject, deleteProject };
