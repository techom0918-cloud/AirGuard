import { getDb, COLLECTIONS, validateAlert } from './firestoreService.js';
import { AlertDocument } from '../types/schema.js';
import { logger } from '../utils/logger.js';

const sortByTimestampDesc = (alerts: AlertDocument[]): AlertDocument[] => {
  return alerts.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

export const alertService = {
  /**
   * Saves a new risk alert document.
   */
  async saveAlert(alertData: AlertDocument, docId?: string): Promise<AlertDocument> {
    validateAlert(alertData);
    const db = getDb();

    const docData: AlertDocument = {
      device_id: alertData.device_id.trim(),
      risk_level: alertData.risk_level,
      lat: alertData.lat,
      lng: alertData.lng,
      timestamp:
        alertData.timestamp instanceof Date
          ? alertData.timestamp.toISOString()
          : alertData.timestamp || new Date().toISOString(),
      resolved: Boolean(alertData.resolved),
    };

    try {
      if (docId && typeof docId === 'string' && docId.trim() !== '') {
        await db.collection(COLLECTIONS.ALERTS).doc(docId.trim()).set(docData);
      } else {
        await db.collection(COLLECTIONS.ALERTS).add(docData);
      }
      logger.info(`Alert saved for device: ${docData.device_id} (risk: ${docData.risk_level})`);
      return docData;
    } catch (error) {
      logger.error(`Failed to save alert for device ${docData.device_id}:`, error);
      throw error;
    }
  },

  /**
   * Retrieves alert history for a specific device ordered by timestamp DESC.
   */
  async getAlertHistory(deviceId: string, limitCount = 50): Promise<AlertDocument[]> {
    if (!deviceId || typeof deviceId !== 'string') return [];
    const db = getDb();

    try {
      const querySnap = await db
        .collection(COLLECTIONS.ALERTS)
        .where('device_id', '==', deviceId.trim())
        .orderBy('timestamp', 'desc')
        .limit(limitCount)
        .get();

      return querySnap.docs.map((doc) => doc.data() as AlertDocument);
    } catch (error: any) {
      if (error?.code === 9 || error?.message?.includes('index')) {
        // Fallback for missing/building Cloud Firestore composite index
        const querySnap = await db
          .collection(COLLECTIONS.ALERTS)
          .where('device_id', '==', deviceId.trim())
          .get();

        const docs = querySnap.docs.map((doc) => doc.data() as AlertDocument);
        return sortByTimestampDesc(docs).slice(0, limitCount);
      }
      logger.error(`Failed to fetch alert history for device ${deviceId}:`, error);
      throw error;
    }
  },

  /**
   * Retrieves active (unresolved) alerts for a specific device ordered by timestamp DESC.
   */
  async getActiveAlerts(deviceId: string): Promise<AlertDocument[]> {
    if (!deviceId || typeof deviceId !== 'string') return [];
    const db = getDb();

    try {
      const querySnap = await db
        .collection(COLLECTIONS.ALERTS)
        .where('device_id', '==', deviceId.trim())
        .where('resolved', '==', false)
        .orderBy('timestamp', 'desc')
        .get();

      return querySnap.docs.map((doc) => doc.data() as AlertDocument);
    } catch (error: any) {
      if (error?.code === 9 || error?.message?.includes('index')) {
        // Fallback for missing/building Cloud Firestore composite index
        const querySnap = await db
          .collection(COLLECTIONS.ALERTS)
          .where('device_id', '==', deviceId.trim())
          .where('resolved', '==', false)
          .get();

        const docs = querySnap.docs.map((doc) => doc.data() as AlertDocument);
        return sortByTimestampDesc(docs);
      }
      logger.error(`Failed to fetch active alerts for device ${deviceId}:`, error);
      throw error;
    }
  },
};
