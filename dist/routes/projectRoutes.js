"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const projectController_1 = require("../controllers/projectController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const upload_1 = __importDefault(require("../middleware/upload"));
const router = express_1.default.Router();
router.route('/').get(projectController_1.getProjects).post(authMiddleware_1.protect, authMiddleware_1.admin, upload_1.default.single('image'), projectController_1.createProject);
router
    .route('/:id')
    .put(authMiddleware_1.protect, authMiddleware_1.admin, upload_1.default.single('image'), projectController_1.updateProject)
    .delete(authMiddleware_1.protect, authMiddleware_1.admin, projectController_1.deleteProject);
exports.default = router;
