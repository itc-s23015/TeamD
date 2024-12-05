// app/page.js

import React from 'react';
import './styles/title.css';

export default function Page() {
  return (
    <div className="container">
      <div className="header">
        <div className="sticker">おえかき！！</div>
        <div className="titleBox">
          <div className="title">伝言ゲーム</div>
          <div className="icons">
            <span className="icon">🎨</span>
            <span className="icon">🏝️</span>
          </div>
        </div>
        <div className="settingsIcons">
          <span className="icon">⚙️</span>
          <span className="icon">🔊</span>
        </div>
      </div>
      <div className="startButtonBox">
        <button className="startButton">スタート</button>
      </div>
    </div>
  );
}

