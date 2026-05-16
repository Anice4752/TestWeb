import { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import VideoPlayer from './components/VideoPlayer';
import HandDetector from './components/HandDetector';
import { LESSONS, type Lesson } from './types';

function App() {
  const [activeLesson, setActiveLesson] = useState<Lesson>(LESSONS[0]);

  const handleCorrectGesture = () => {
    console.log('Gesture Correct!');
  };

  return (
    <div className="app-container">
      <Sidebar 
        activeLesson={activeLesson} 
        onSelectLesson={setActiveLesson} 
      />
      
      <main className="main-content">
        <header className="top-bar">
          <div>
            <h1>บทเรียน: {activeLesson.title}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              ฝึกฝนทักษะภาษามือของคุณด้วยระบบ AI ตรวจจับอัจฉริยะ
            </p>
          </div>
          <div style={{ background: 'var(--primary-light)', padding: '0.5rem 1rem', borderRadius: '20px', color: 'var(--primary)', fontWeight: '600', fontSize: '0.85rem' }}>
            โŸ“– โหมดการเรียนรู้
          </div>
        </header>

        <div className="learning-container">
          <VideoPlayer lesson={activeLesson} />
          <HandDetector 
            targetGesture={activeLesson.gestureType} 
            onCorrect={handleCorrectGesture} 
          />
        </div>
      </main>
    </div>
  );
}

export default App;
