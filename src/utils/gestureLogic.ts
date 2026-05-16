export const checkGesture = (landmarksList: any[][], gestureType: string): boolean => {
  if (!landmarksList || landmarksList.length === 0) return false;

  const getDist = (p1: any, p2: any) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2));
  };

  const getHandInfo = (hand: any[]) => {
    const wrist = hand[0];
    
    // Precise extension check: Tip must be significantly further from wrist than PIP and MCP
    const isExtended = (tipIdx: number, pipIdx: number, mcpIdx: number) => {
      const tipDist = getDist(hand[tipIdx], wrist);
      const pipDist = getDist(hand[pipIdx], wrist);
      const mcpDist = getDist(hand[mcpIdx], wrist);
      return tipDist > pipDist * 1.15 && tipDist > mcpDist * 1.3; 
    };

    const isFolded = (tipIdx: number, mcpIdx: number) => {
      const tipDist = getDist(hand[tipIdx], wrist);
      const mcpDist = getDist(hand[mcpIdx], wrist);
      return tipDist < mcpDist * 1.1; // Tip is close to or inside the palm area
    };

    const isThumbExtended = () => {
      const thumbTip = hand[4];
      const thumbMcp = hand[2];
      const indexMcp = hand[5];
      
      // Distance from wrist
      const wristDist = getDist(thumbTip, wrist);
      const mcpDist = getDist(thumbMcp, wrist);
      
      // Spread from index finger
      const spreadDist = getDist(thumbTip, indexMcp);
      
      return (wristDist > mcpDist * 1.2) || (spreadDist > 0.1);
    };

    return {
      indexExt: isExtended(8, 6, 5),
      middleExt: isExtended(12, 10, 9),
      ringExt: isExtended(16, 14, 13),
      pinkyExt: isExtended(20, 18, 17),
      indexFold: isFolded(8, 5),
      middleFold: isFolded(12, 9),
      ringFold: isFolded(16, 13),
      pinkyFold: isFolded(20, 17),
      thumbExt: isThumbExtended()
    };
  };

  const hands = landmarksList.map(getHandInfo);

  switch (gestureType) {
    case 'OPEN_HAND':
      return hands.some(h => {
        const extCount = [h.indexExt, h.middleExt, h.ringExt, h.pinkyExt].filter(v => v).length;
        return extCount >= 3 && h.thumbExt; // At least 3 fingers + thumb
      });

    case 'FIST':
      return hands.some(h => {
        const foldCount = [h.indexFold, h.middleFold, h.ringFold, h.pinkyFold].filter(v => v).length;
        const extCount = [h.indexExt, h.middleExt, h.ringExt, h.pinkyExt].filter(v => v).length;
        return foldCount >= 3 && extCount === 0;
      });

    case 'V_SIGN':
      return hands.some(h => 
        h.indexExt && h.middleExt && !h.ringExt && !h.pinkyExt && h.ringFold && h.pinkyFold
      );

    case 'TWO_HANDS_OPEN':
      if (hands.length < 2) return false;
      return hands.every(h => {
        const extCount = [h.indexExt, h.middleExt, h.ringExt, h.pinkyExt, h.thumbExt].filter(v => v).length;
        return extCount >= 4;
      });

    default:
      return false;
  }
};
