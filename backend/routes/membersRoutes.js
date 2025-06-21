import express from 'express';
import MembersController from '../controllers/membersController.js';
import { authenticateToken } from '../src/config/auth.js';

const router = express.Router();

// Rotas de membros
router.get('/api/members', MembersController.getAllMembers);

router.get('/api/members/:username', MembersController.getMemberByUsername);

router.get('/api/members/stats/total', MembersController.getMembersStats);  // Note que você chamou getTotalMembers, mas no controller o método é getMembersStats
router.get('/api/members/online', MembersController.getOnlineMembers);
router.get('/api/members/online/list', MembersController.getDetailedOnlineMembers);
router.get('/api/members/:username/posts', MembersController.countUserPosts);

router.post('/api/seguir/:nickname', authenticateToken, MembersController.followUser);
router.get('/api/seguir/view/:nickname', authenticateToken, MembersController.viewFollowers);
router.get('/api/seguir/check/:nickname', authenticateToken, MembersController.checkFollow);


export default router;
