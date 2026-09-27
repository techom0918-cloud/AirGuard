import { Router } from 'express';
import { alertController } from '../controllers/alertController.js';

const router = Router();

router.post('/', alertController.saveAlert);
router.get('/:deviceId/active', alertController.getActiveAlerts);
router.get('/:deviceId', alertController.getAlertHistory);

export default router;
