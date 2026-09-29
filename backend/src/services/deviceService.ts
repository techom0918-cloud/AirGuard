import { getDb, COLLECTIONS, validateDevice } from './firestoreService.js';
import { DeviceDocument } from '../types/schema.js';
import { logger } from '../utils/logger.js';

export async function registerDevice(deviceData: DeviceDocument): Promise<DeviceDocument> {
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
    await db.collection(COLLECTIONS.DEVICES).doc(docData.device_id).set(docData, { merge: true });
    logger.info(`Device registered successfully: ${docData.device_id}`);
    return docData;
  } catch (error) {
    logger.error(`Failed to register device ${docData.device_id}:`, error);
    throw error;
  }
}

export async function getDevice(deviceId: string): Promise<DeviceDocument | null> {
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
}

export const getDeviceById = getDevice;

export async function listDevices(): Promise<DeviceDocument[]> {
  const db = getDb();

  try {
    const querySnap = await db.collection(COLLECTIONS.DEVICES).get();
    return querySnap.docs.map((doc) => doc.data() as DeviceDocument);
  } catch (error) {
    logger.error('Failed to list devices:', error);
    throw error;
  }
}

export const deviceService = {
  registerDevice,
  getDevice,
  getDeviceById,
  listDevices,
};
