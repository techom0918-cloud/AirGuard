import { getDb, COLLECTIONS, validateReading } from './firestoreService.js';
import { ReadingDocument } from '../types/schema.js';
import { logger } from '../utils/logger.js';

export interface HeatmapFilterOptions {
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
  limitCount?: number;
  limit?: number;
}

const sortByTimestampDesc = (readings: ReadingDocument[]): ReadingDocument[] => {
  return readings.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

export async function saveReading(readingData: ReadingDocument, docId?: string): Promise<ReadingDocument> {
  validateReading(readingData);
  const db = getDb();

  const docData: ReadingDocument = {
    device_id: readingData.device_id.trim(),
    temp: readingData.temp,
    humidity: readingData.humidity,
    risk_level: readingData.risk_level,
    lat: readingData.lat,
    lng: readingData.lng,
    timestamp:
      readingData.timestamp instanceof Date
        ? readingData.timestamp.toISOString()
        : readingData.timestamp || new Date().toISOString(),
  };

  if (readingData.pm25 !== undefined && readingData.pm25 !== null) {
    docData.pm25 = readingData.pm25;
  }
  if (readingData.mq135_raw !== undefined && readingData.mq135_raw !== null) {
    docData.mq135_raw = readingData.mq135_raw;
  }
  if (readingData.sensor_voltage !== undefined && readingData.sensor_voltage !== null) {
    docData.sensor_voltage = readingData.sensor_voltage;
  }
  if (readingData.air_quality_score !== undefined && readingData.air_quality_score !== null) {
    docData.air_quality_score = readingData.air_quality_score;
  }

  try {
    if (docId && typeof docId === 'string' && docId.trim() !== '') {
      await db.collection(COLLECTIONS.READINGS).doc(docId.trim()).set(docData);
    } else {
      await db.collection(COLLECTIONS.READINGS).add(docData);
    }
    logger.info(`Reading saved for device: ${docData.device_id}`);
    return docData;
  } catch (error) {
    logger.error(`Failed to save reading for device ${docData.device_id}:`, error);
    throw error;
  }
}

export async function getLatestReading(deviceId: string): Promise<ReadingDocument | null> {
  if (!deviceId || typeof deviceId !== 'string') return null;
  const db = getDb();

  try {
    const querySnap = await db
      .collection(COLLECTIONS.READINGS)
      .where('device_id', '==', deviceId.trim())
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (querySnap.empty) {
      return null;
    }
    return querySnap.docs[0]!.data() as ReadingDocument;
  } catch (error: any) {
    if (error?.code === 9 || error?.message?.includes('index')) {
      const querySnap = await db
        .collection(COLLECTIONS.READINGS)
        .where('device_id', '==', deviceId.trim())
        .get();

      if (querySnap.empty) return null;
      const docs = querySnap.docs.map((doc) => doc.data() as ReadingDocument);
      return sortByTimestampDesc(docs)[0] || null;
    }
    logger.error(`Failed to fetch latest reading for device ${deviceId}:`, error);
    throw error;
  }
}

export async function getReadingHistory(deviceId: string, limitCount: number | HeatmapFilterOptions = 50): Promise<ReadingDocument[]> {
  if (!deviceId || typeof deviceId !== 'string') return [];
  const limitVal = typeof limitCount === 'number' ? limitCount : (limitCount?.limit || limitCount?.limitCount || 50);
  const db = getDb();

  try {
    const querySnap = await db
      .collection(COLLECTIONS.READINGS)
      .where('device_id', '==', deviceId.trim())
      .orderBy('timestamp', 'desc')
      .limit(limitVal)
      .get();

    return querySnap.docs.map((doc) => doc.data() as ReadingDocument);
  } catch (error: any) {
    if (error?.code === 9 || error?.message?.includes('index')) {
      const querySnap = await db
        .collection(COLLECTIONS.READINGS)
        .where('device_id', '==', deviceId.trim())
        .get();

      const docs = querySnap.docs.map((doc) => doc.data() as ReadingDocument);
      return sortByTimestampDesc(docs).slice(0, limitVal);
    }
    logger.error(`Failed to fetch readings for device ${deviceId}:`, error);
    throw error;
  }
}

export const getDeviceReadings = getReadingHistory;

export async function getHeatmapReadings(options: HeatmapFilterOptions = {}): Promise<ReadingDocument[]> {
  const db = getDb();
  const limitCount = options.limitCount || options.limit || 100;

  try {
    let query: any = db.collection(COLLECTIONS.READINGS);

    if (options.minLat !== undefined && Number.isFinite(options.minLat)) {
      query = query.where('lat', '>=', options.minLat);
    }
    if (options.maxLat !== undefined && Number.isFinite(options.maxLat)) {
      query = query.where('lat', '<=', options.maxLat);
    }

    query = query.orderBy('timestamp', 'desc');

    const querySnap = await query.limit(limitCount).get();
    let results = querySnap.docs.map((doc: any) => doc.data() as ReadingDocument);

    if (options.minLng !== undefined && Number.isFinite(options.minLng)) {
      results = results.filter((r: ReadingDocument) => r.lng >= options.minLng!);
    }
    if (options.maxLng !== undefined && Number.isFinite(options.maxLng)) {
      results = results.filter((r: ReadingDocument) => r.lng <= options.maxLng!);
    }

    return results;
  } catch (error: any) {
    if (error?.code === 9 || error?.message?.includes('index')) {
      const querySnap = await db.collection(COLLECTIONS.READINGS).get();
      let results = querySnap.docs.map((doc) => doc.data() as ReadingDocument);

      if (options.minLat !== undefined && Number.isFinite(options.minLat)) {
        results = results.filter((r) => r.lat >= options.minLat!);
      }
      if (options.maxLat !== undefined && Number.isFinite(options.maxLat)) {
        results = results.filter((r) => r.lat <= options.maxLat!);
      }
      if (options.minLng !== undefined && Number.isFinite(options.minLng)) {
        results = results.filter((r) => r.lng >= options.minLng!);
      }
      if (options.maxLng !== undefined && Number.isFinite(options.maxLng)) {
        results = results.filter((r) => r.lng <= options.maxLng!);
      }

      return sortByTimestampDesc(results).slice(0, limitCount);
    }
    logger.error('Failed to fetch heatmap readings:', error);
    throw error;
  }
}

export const readingService = {
  saveReading,
  getLatestReading,
  getReadingHistory,
  getDeviceReadings,
  getHeatmapReadings,
};
