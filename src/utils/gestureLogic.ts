export const checkGesture = (landmarksList: any[][], gestureType: string): boolean => {
  if (!landmarksList || landmarksList.length === 0) return false;

  const getDist = (p1: any, p2: any) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2));
  };

  // Calculate angle between three points
  const getAngle = (p1: any, p2: any, p3: any) => {
    const v1 = { x: p1.x - p2.x, y: p1.y - p2.y, z: p1.z - p2.z };
    const v2 = { x: p3.x - p2.x, y: p3.y - p2.y, z: p3.z - p2.z };
    const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);
    return Math.acos(dot / (mag1 * mag2)) * (180 / Math.PI);
  };

  const getHandInfo = (hand: any[]) => {
    const wrist = hand[0];
    
    // Improved finger check: Uses both distance and joint angles (more resilient to speed/blur)
    const isFingerExtended = (tip: number, pip: number, mcp: number) => {
      const angle = getAngle(hand[tip], hand[pip], hand[mcp]);
      const distTipWrist = getDist(hand[tip], wrist);
      const distMcpWrist = getDist(hand[mcp], wrist);
      
      // Extension: Angle should be close to 180 degrees, and tip must be far from wrist
      return angle > 150 && distTipWrist > distMcpWrist * 1.2;
    };

    const isFingerFolded = (tip: number, mcp: number) => {
      const distTipWrist = getDist(hand[tip], wrist);
      const distMcpWrist = getDist(hand[mcp], wrist);
      // Folded: Tip is tucked towards or past the base
      return distTipWrist < distMcpWrist * 1.05;
    };

    const isThumbExtended = () => {
      const tip = hand[4];
      const mcp = hand[2];
      const indexMcp = hand[5];
      
      const angle = getAngle(tip, hand[3], mcp);
      const spread = getDist(tip, indexMcp);
      const distTipWrist = getDist(tip, wrist);
      
      // Thumb is tricky: needs angle or significant spread
      return angle > 155 || spread > 0.13 || distTipWrist > getDist(mcp, wrist) * 1.3;
    };

    return {
      index: isFingerExtended(8, 6, 5),
      middle: isFingerExtended(12, 10, 9),
      ring: isFingerExtended(16, 14, 13),
      pinky: isFingerExtended(20, 18, 17),
      thumb: isThumbExtended(),
      indexFold: isFingerFolded(8, 5),
      middleFold: isFingerFolded(12, 9),
      ringFold: isFingerFolded(16, 13),
      pinkyFold: isFingerFolded(20, 17)
    };
  };

  const hands = landmarksList.map(getHandInfo);

  switch (gestureType) {
    case 'OPEN_HAND':
      return hands.some(h => h.index && h.middle && h.ring && h.pinky && h.thumb);

    case 'FIST':
      return hands.some(h => h.indexFold && h.middleFold && h.ringFold && h.pinkyFold);

    case 'V_SIGN':
      // V-sign: specific check for index and middle extended, others tightly folded
      return hands.some(h => h.index && h.middle && h.ringFold && h.pinkyFold && !h.ring && !h.pinky);

    case 'TWO_HANDS_OPEN':
      if (hands.length < 2) return false;
      return hands.every(h => h.index && h.middle && h.ring && h.pinky && h.thumb);

    default:
      return false;
  }
};
