import express from 'express';
import ForumController from '../controllers/forumController.js';
import { authenticateToken } from '../src/config/auth.js';

const router = express.Router();

router.get("/api/team", ForumController.getAllTeamMembers);
router.get('/api/forum/categories', ForumController.getCategories);
router.delete('/api/forum/delete/reply/:id', ForumController.deleteReply);
router.get('/api/forum/topic/:id', ForumController.getTopicDetails);
router.put('/api/forum/topic/:id/lock', ForumController.toggleTopicLock);
router.post('/api/forum/topic/:id/view', ForumController.registerView);
router.post('/api/forum/topics', ForumController.createTopic);
router.post('/api/forum/topic/:id/reply', ForumController.getTopicReply);
router.get('/api/forum/topic/:id/replies', ForumController.getTopicReplies);
router.delete('/api/forum/delete/topic/:id', ForumController.deleteTopic);
router.get('/api/forum/topics/featured', ForumController.getFeaturedTopics);
router.get('/api/forum/recent-topics', ForumController.getRecentTopics);
router.get('/api/forum/topics/:category', ForumController.getTopicsByCategory);
router.delete('/api/forum/delete/reply/:id', ForumController.deleteReply);
router.get('/api/forum/stats', ForumController.getForumStats);
router.get('/api/forum/subcategories', ForumController.getSubcategories);
router.get('/api/forum/topics/:category/:subcategory', ForumController.getTopicsByCategoryAndSubcategory);
router.get('/api/forum/category-has-subcategories', ForumController.checkCategoryHasSubcategories);

export default router;