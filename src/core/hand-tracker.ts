import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

const BASE = import.meta.env.BASE_URL;
/** Index finger tip in MediaPipe's 21-point hand model. */
const INDEX_TIP = 8;

export type TrackerStatus = 'loading' | 'ready' | 'failed';

/**
 * Finds hands in the webcam image with MediaPipe (runs fully in the browser,
 * nothing is uploaded or saved) and reports each index-finger tip.
 */
export class HandTracker {
  status: TrackerStatus = 'loading';
  private landmarker: HandLandmarker | null = null;
  private lastVideoTime = -1;

  async init(): Promise<void> {
    try {
      // Runtime + model are served from our own folder (see scripts/vendor-mediapipe.mjs).
      const fileset = await FilesetResolver.forVisionTasks(`${BASE}mediapipe/wasm`);
      const create = (delegate: 'GPU' | 'CPU') =>
        HandLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: `${BASE}mediapipe/hand_landmarker.task`, delegate },
          runningMode: 'VIDEO',
          numHands: 4,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      this.landmarker = await create('GPU').catch(() => create('CPU'));
      this.status = 'ready';
    } catch (err) {
      console.error('[hand-tracker]', err);
      this.status = 'failed';
    }
  }

  /** Normalized fingertips for a new video frame, or null if there is no new frame. */
  detect(video: HTMLVideoElement): { x: number; y: number }[] | null {
    if (!this.landmarker || video.readyState < 2 || video.currentTime === this.lastVideoTime) {
      return null;
    }
    this.lastVideoTime = video.currentTime;
    const result = this.landmarker.detectForVideo(video, performance.now());
    return result.landmarks.map((hand) => ({ x: hand[INDEX_TIP].x, y: hand[INDEX_TIP].y }));
  }
}
