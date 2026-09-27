import { getDb, COLLECTIONS, validateDevice } from './firestoreService.js';
import { DeviceDocument } from '../types/schema.js';
import { logger } from '../utils/logger.js';

export const deviceService = {
  /**
   * Registers or updates a device document in the devices collection.
   */
  async registerDevice(deviceData: DeviceDocument): Promise<DeviceDocument> {
    validateDevice(deviceData);
    const db = getDb();

    const docData: DeviceDocument = {
      device_id: deviceData.device_id.trim(),
      owner: deviceData.owner.trim(),
      registered_at:
        deviceData.registered_at instanceof Date
          ? deviceData.registered_at.toISOString()
          : deviceData.registered_at || new Date().toISOString(),
    };

    try {
      await db.collection(COLLECTIONS.DEVICES).doc(docData.device_id).set(docData);
      logger.info(`Device registered successfully: ${docData.device_id}`);
      return docData;
    } catch (error) {
      logger.error(`Failed to register device ${docData.device_id}:`, error);
      throw error;
    }
  },

  /**
   * Retrieves a device by device_id.
   */
  async getDeviceById(deviceId: string): Promise<DeviceDocument | null> {
    if (!deviceId || typeof deviceId !== 'string') return null;
    const db = getDb();

    try {
      const docSnap = await db.collection(COLLECTIONS.DEVICES).doc(deviceId.trim()).get();
      if (!docSnap.exists) {
        return null;
      }
      return docSnap.data() as DeviceDocument;
    } catch (error) {
      logger.error(`Failed to fetch device ${deviceId}:`, error);
      throw error;
    }
  },

  /**
   * Lists all registered devices.
   */
  async listDevices(): Promise<DeviceDocument[]> {
    const db = getDb();

    try {
      const querySnap = await db.collection(COLLECTIONS.DEVICES).get();
      return querySnap.docs.map((doc) => doc.data() as DeviceDocument);
    } catch (error) {
      logger.error('Failed to list devices:', error);
      throw error;
    }
  },
};
