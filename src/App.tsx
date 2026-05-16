import { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import VideoPlayer from './components/VideoPlayer';
import HandDetector from './components/HandDetector';
import { LESSONS, type Lesson } from './types';

function App() {
  const [activeLesson, setActiveLesson] = useState<Lesson>(LESSONS[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleCorrectGesture = () => {
    console.log('Gesture Correct!');
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar 
        activeLesson={activeLesson} 
        onSelectLesson={handleSelectLesson} 
      />
      
      <main className="main-content">
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="mobile-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle Menu"
            >
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </button>
            <div>
              <h1>บทเรียน: {activeLesson.title}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                ฝึกฝนทักษะภาษามือของคุณด้วยระบบ AI ตรวจจับอัจฉริยะ
              </p>
            </div>
          </div>
          <div className="badge-desktop" style={{ background: 'var(--primary-light)', padding: '0.5rem 1rem', borderRadius: '20px', color: 'var(--primary)', fontWeight: '600', fontSize: '0.85rem' }}>
            โหมดการเรียนรู้
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
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
    </div>
  );
}

export default App;
