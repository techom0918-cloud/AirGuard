import { Router } from 'express';
import { deviceController } from '../controllers/deviceController.js';

const router = Router();

router.post('/', deviceController.registerDevice);
router.get('/', deviceController.listDevices);
router.get('/:deviceId', deviceController.getDeviceById);

export default router;
