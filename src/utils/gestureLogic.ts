export const checkGesture = (landmarksList: any[][], gestureType: string): boolean => {
  if (!landmarksList || landmarksList.length === 0) return false;

  const getDist = (p1: any, p2: any) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2));
  };

  const getHandInfo = (hand: any[]) => {
    const wrist = hand[0];
    
    // Made more lenient: Tip only needs to be 10% further than PIP
    const isExtended = (tipIdx: number, pipIdx: number) => {
      const tipDist = getDist(hand[tipIdx], wrist);
      const pipDist = getDist(hand[pipIdx], wrist);
      return tipDist > pipDist * 1.1; 
    };

    const isFolded = (tipIdx: number, pipIdx: number) => {
      const tipDist = getDist(hand[tipIdx], wrist);
      const pipDist = getDist(hand[pipIdx], wrist);
      return tipDist < pipDist * 0.95; 
    };

    const isThumbExtended = () => {
      const thumbTip = hand[4];
      const indexMcp = hand[5];
      const wristDist = getDist(thumbTip, wrist);
      const indexMcpDist = getDist(indexMcp, wrist);
      return wristDist > indexMcpDist * 0.7 || getDist(thumbTip, indexMcp) > 0.08;
    };

    return {
      indexExt: isExtended(8, 6),
      middleExt: isExtended(12, 10),
      ringExt: isExtended(16, 14),
      pinkyExt: isExtended(20, 18),
      indexFold: isFolded(8, 6),
      middleFold: isFolded(12, 10),
      ringFold: isFolded(16, 14),
      pinkyFold: isFolded(20, 18),
      thumbExt: isThumbExtended()
    };
  };

  const hands = landmarksList.map(getHandInfo);

  switch (gestureType) {
    case 'OPEN_HAND':
      // Lenient: If 4 out of 5 fingers are extended, it's an open hand
      return hands.some(h => {
        const extCount = [h.indexExt, h.middleExt, h.ringExt, h.pinkyExt, h.thumbExt].filter(v => v).length;
        return extCount >= 4;
      });

    case 'FIST':
      // Lenient: If at least 3 fingers are folded and none are clearly extended
      return hands.some(h => {
        const foldCount = [h.indexFold, h.middleFold, h.ringFold, h.pinkyFold].filter(v => v).length;
        const anyExt = h.indexExt || h.middleExt || h.ringExt || h.pinkyExt;
        return foldCount >= 3 && !anyExt;
      });

    case 'V_SIGN':
      return hands.some(h => h.indexExt && h.middleExt && h.ringFold && h.pinkyFold);

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
