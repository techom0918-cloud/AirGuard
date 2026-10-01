import { Router } from 'express';
import { heatmapController } from '../controllers/heatmapController.js';

const router = Router();

router.get('/', heatmapController.getHeatmapData);

export default router;
