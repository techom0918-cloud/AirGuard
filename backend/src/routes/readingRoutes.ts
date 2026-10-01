import { Router } from 'express';
import { readingController } from '../controllers/readingController.js';

const router = Router();

router.post('/', readingController.saveReading);
router.get('/:deviceId/latest', readingController.getLatestReading);
router.get('/:deviceId', readingController.getDeviceReadings);

export default router;
