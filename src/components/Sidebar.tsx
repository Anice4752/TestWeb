import React from 'react';
import { LESSONS, type Lesson } from '../types';

interface SidebarProps {
  activeLesson: Lesson;
  onSelectLesson: (lesson: Lesson) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeLesson, onSelectLesson }) => {
  const categories = Array.from(new Set(LESSONS.map((l) => l.category)));

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2><span>SignLearn AI</span></h2>
      </div>
      <div className="lesson-list">
        {categories.map((cat) => (
          <div key={cat} className="category-group">
            <div className="category-label">{cat}</div>
            {LESSONS.filter((l) => l.category === cat).map((lesson) => (
              <button
                key={lesson.id}
                className={`lesson-btn ${activeLesson.id === lesson.id ? 'active' : ''}`}
                onClick={() => onSelectLesson(lesson)}
              >
                {lesson.title}
              </button>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
