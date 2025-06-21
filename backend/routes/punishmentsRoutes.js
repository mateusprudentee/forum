import { Router } from 'express';
import PunishmentsController from '../controllers/punishmentsController.js';
import { authenticateToken } from '../src/config/auth.js';

const router = Router();

// Rotas públicas
router.get('/api/punicoes/list', PunishmentsController.list);
router.get('/api/punicoes/nick/:nick', PunishmentsController.checkByNick);
router.get('/api/punicoes/stats', PunishmentsController.getStats);
router.post('/api/punicoes/add', authenticateToken, PunishmentsController.create);
router.put('/api/punicoes/:id/status', authenticateToken, PunishmentsController.updateStatus);
router.put('/api/punicoes/:id/termino', authenticateToken, PunishmentsController.updateTermino);

export default router;