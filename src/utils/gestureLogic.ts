export const checkGesture = (landmarksList: any[][], gestureType: string): boolean => {
  if (!landmarksList || landmarksList.length === 0) return false;

  const getDist = (p1: any, p2: any) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2));
  };

  const getHandInfo = (hand: any[]) => {
    const wrist = hand[0];
    
    // Check extension for each finger using its 4 landmarks
    // Tip (8/12/16/20), PIP (6/10/14/18), MCP (5/9/13/17)
    const isFingerExtended = (tipIdx: number, dipIdx: number, pipIdx: number, mcpIdx: number) => {
      const tipDist = getDist(hand[tipIdx], wrist);
      const dipDist = getDist(hand[dipIdx], wrist);
      const pipDist = getDist(hand[pipIdx], wrist);
      const mcpDist = getDist(hand[mcpIdx], wrist);
      
      // Strict sequence: Tip must be furthest, followed by DIP, PIP, and MCP
      return tipDist > dipDist && dipDist > pipDist && pipDist > mcpDist;
    };

    const isFingerFolded = (tipIdx: number, mcpIdx: number) => {
      const tipDist = getDist(hand[tipIdx], wrist);
      const mcpDist = getDist(hand[mcpIdx], wrist);
      // Tip is significantly closer to the wrist than the base of the finger
      return tipDist < mcpDist * 0.9;
    };

    const isThumbExtended = () => {
      const tip = hand[4];
      const ip = hand[3];
      const mcp = hand[2];
      const cmc = hand[1];
      
      const tipDist = getDist(tip, wrist);
      const ipDist = getDist(ip, wrist);
      const mcpDist = getDist(mcp, wrist);
      
      // Horizontal spread check (relative to index finger base)
      const indexBase = hand[5];
      const spread = getDist(tip, indexBase);
      
      return (tipDist > ipDist && ipDist > mcpDist && mcpDist > getDist(cmc, wrist)) || spread > 0.12;
    };

    return {
      index: isFingerExtended(8, 7, 6, 5),
      middle: isFingerExtended(12, 11, 10, 9),
      ring: isFingerExtended(16, 15, 14, 13),
      pinky: isFingerExtended(20, 19, 18, 17),
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
      return hands.some(h => h.index && h.middle && h.ringFold && h.pinkyFold);

    case 'TWO_HANDS_OPEN':
      if (hands.length < 2) return false;
      return hands.every(h => h.index && h.middle && h.ring && h.pinky && h.thumb);

    default:
      return false;
  }
};
