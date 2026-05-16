import React, { useEffect, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { checkGesture } from '../utils/gestureLogic';

interface HandDetectorProps {
  targetGesture: string;
  onCorrect: () => void;
}

const HandDetector: React.FC<HandDetectorProps> = ({ targetGesture, onCorrect }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [detectedHands, setDetectedHands] = useState<{left: boolean, right: boolean}>({left: false, right: false});
  const requestRef = useRef<number>(null);

  // Stability state
  const stabilityCounter = useRef(0);
  
  // Motion tracking state
  const motionState = useRef({
    rotations: 0,
    lastQuadrant: -1,
  });

  const targetGestureRef = useRef(targetGesture);

  useEffect(() => {
    targetGestureRef.current = targetGesture;
    setIsCorrect(false);
    motionState.current = { rotations: 0, lastQuadrant: -1 };
    stabilityCounter.current = 0;
  }, [targetGesture]);

  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.1,
          minHandPresenceConfidence: 0.1,
          minTrackingConfidence: 0.1
        });
        await startCamera();
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to initialize MediaPipe:", err);
        setError("ไม่สามารถโหลดระบบตรวจจับมือได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต");
        setIsLoading(false);
      }
    };

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Browser does not support camera access");
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => {
            predictWebcam();
          };
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setError("ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการเข้าถึงกล้อง");
      }
    };

    initMediaPipe();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const predictWebcam = async () => {
    if (!videoRef.current || !canvasRef.current || !handLandmarkerRef.current) return;

    try {
      if (videoRef.current.readyState >= 2) {
        const startTimeMs = performance.now();
        const results = handLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          const drawingUtils = new DrawingUtils(ctx);

          const presence = { left: false, right: false };

          if (results.landmarks && results.landmarks.length > 0) {
            results.handedness.forEach((h: any) => {
              if (h[0].categoryName === 'Left') presence.left = true;
              if (h[0].categoryName === 'Right') presence.right = true;
            });

            for (const landmarks of results.landmarks) {
              drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
                color: "#4338ca",
                lineWidth: 3
              });
              drawingUtils.drawLandmarks(landmarks, { color: "#10b981", lineWidth: 1, radius: 2 });
            }

            if (targetGestureRef.current === 'CIRCLE_PALM') {
              handleMotionGesture(results);
            } else {
              const isGestureCorrect = checkGesture(results.landmarks, targetGestureRef.current);
              
              if (isGestureCorrect) {
                stabilityCounter.current += 1;
                if (stabilityCounter.current >= 8 && !isCorrect) {
                  triggerCorrect();
                }
              } else {
                stabilityCounter.current = Math.max(0, stabilityCounter.current - 1);
              }
            }
          } else {
            stabilityCounter.current = 0;
          }
          setDetectedHands(presence);
        }
      }
    } catch (err) {
      console.error("Prediction error:", err);
    }

    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  const handleMotionGesture = (results: any) => {
    if (results.landmarks.length < 2) return;

    let leftIdx = -1;
    let rightIdx = -1;
    results.handedness.forEach((h: any, idx: number) => {
      if (h[0].categoryName === 'Left') leftIdx = idx;
      if (h[0].categoryName === 'Right') rightIdx = idx;
    });

    if (leftIdx !== -1 && rightIdx !== -1) {
      const leftPalm = results.landmarks[leftIdx][9];
      const rightIndex = results.landmarks[rightIdx][8];

      const relX = rightIndex.x - leftPalm.x;
      const relY = rightIndex.y - leftPalm.y;

      let quadrant = -1;
      if (relX > 0 && relY < 0) quadrant = 0;
      else if (relX > 0 && relY > 0) quadrant = 1;
      else if (relX < 0 && relY > 0) quadrant = 2;
      else if (relX < 0 && relY < 0) quadrant = 3;

      if (quadrant !== -1 && quadrant !== motionState.current.lastQuadrant) {
        const expected = (motionState.current.lastQuadrant + 1) % 4;
        if (quadrant === expected) {
          if (quadrant === 0) motionState.current.rotations += 1;
        }
        motionState.current.lastQuadrant = quadrant;
      }

      if (motionState.current.rotations >= 3 && !isCorrect) {
        triggerCorrect();
      }
    }
  };

  const triggerCorrect = () => {
    setIsCorrect(true);
    onCorrect();
    setTimeout(() => {
      setIsCorrect(false);
      motionState.current.rotations = 0;
      stabilityCounter.current = 0;
    }, 3000);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>โŸ“ท กล้องตรวจจับอัจฉริยะ</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: detectedHands.left ? '#10b981' : '#e2e8f0', color: 'white', transition: 'background 0.3s' }}>ซ้าย</span>
          <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: detectedHands.right ? '#10b981' : '#e2e8f0', color: 'white', transition: 'background 0.3s' }}>ขวา</span>
        </div>
      </div>
      <div className="card-body">
        <div className="media-wrapper">
          {isLoading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>กำลังวิเคราะห์โครงสร้างมือ...</p>
            </div>
          )}
          {error && (
            <div className="loading-overlay" style={{ color: '#ef4444', textAlign: 'center', padding: '1.5rem' }}>
              <p>โŸธ  {error}</p>
            </div>
          )}
          <video ref={videoRef} autoPlay playsInline muted style={{ display: error ? 'none' : 'block' }} />
          <canvas ref={canvasRef} width="640" height="480" />
          {isCorrect && (
            <div className="feedback-overlay">
              <div className="feedback-badge">ทำถูกแล้ว! โŸŽ‰</div>
            </div>
          )}
        </div>
        <div className="instruction-panel" style={{ background: '#f0fdf4', borderColor: '#22c55e' }}>
          <p style={{ color: '#166534' }}>โŸ–ข เคล็ดลับ: สำหรับมือแนวนอน ให้พยายามแบฝ่ามือเข้าหาหน้ากล้องตรงๆ ก่อนเพื่อให้ AI ล็อกตำแหน่งได้แม่นยำขึ้น</p>
        </div>
      </div>
    </div>
  );
};

export default HandDetector;
