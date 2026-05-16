export interface Lesson {
  id: string;
  category: string;
  title: string;
  videoUrl: string;
  gestureType: 'OPEN_HAND' | 'FIST' | 'THUMBS_UP' | 'V_SIGN' | 'TWO_HANDS_OPEN' | 'PRAYER' | 'CIRCLE_PALM';
}

/**
 * โŸ—’๏ธ  คำแนะนำสำหรับการแก้ไขวิดีโอ:
 * 1. นำไฟล์วิดีโอของคุณไปวางในโฟลเดอร์ public/videos/
 * 2. เปลี่ยนค่าในช่อง videoUrl จาก URL เว็บไซต์ เป็นพาธไฟล์ของคุณ เช่น '/videos/my_video.mp4'
 */
export const LESSONS: Lesson[] = [
  {
    id: '1',
    category: 'บทนำ (Basics)',
    title: 'ท่ามือแบ (Open Hand)',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', 
    gestureType: 'OPEN_HAND',
  },
  {
    id: '2',
    category: 'บทนำ (Basics)',
    title: 'ท่ากำหมัด (Closed Fist)',
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    gestureType: 'FIST',
  },
  {
    id: '3',
    category: 'ท่าทางสื่อสาร (Signs)',
    title: 'ท่าชูสองนิ้ว (V Sign)',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    gestureType: 'V_SIGN',
  },
  {
    id: '4',
    category: 'ขั้นสูง (Advanced)',
    title: 'ท่าแบสองมือ (Both Hands Open)',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    gestureType: 'TWO_HANDS_OPEN',
  },
  {
    id: '5',
    category: 'ภาษาของอาจารย์ (Custom)',
    title: 'ท่าวนนิ้วเหนือฝ่ามือ (Circle Palm)',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    gestureType: 'CIRCLE_PALM',
  }
];
