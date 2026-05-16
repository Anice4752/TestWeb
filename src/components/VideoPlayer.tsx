import React from 'react';
import type { Lesson } from '../types';

interface VideoPlayerProps {
  lesson: Lesson;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ lesson }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3>โ–ถ วิดีโอสาธิต: {lesson.title}</h3>
      </div>
      <div className="card-body">
        <div className="media-wrapper">
          <video 
            key={lesson.id} 
            src={lesson.videoUrl} 
            controls 
            autoPlay 
            loop 
            muted 
          />
        </div>
        <div className="instruction-panel">
          <p>โŸ’ก คำแนะนำ: สังเกตการวางนิ้วและเลียนแบบท่าทางในวิดีโอให้ใกล้เคียงที่สุด</p>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
