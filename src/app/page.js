// page.js
'use client'; // Client Componentとして指定

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // useRouter を next/navigation からインポート
import styles from './styles/title.module.css'; // スタイルシートをインポート
import Modal from './components/modal';

export default function Page() {
  const router = useRouter(); // useRouter を使ってルーターを取得
  const [isModalOpen, setIsModalOpen] = useState(false);

  // スタートボタンがクリックされたときに実行される関数
  const handleStart = () => {
    
    router.push('/room'); // /room ページに遷移
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.sticker}>おえかき！！</div>
        <div className={styles.titleBox}>
          <div className={styles.title}>伝言ゲーム</div>
          <div className={styles.icons}>
            <span className={styles.icon}>🎨</span>
            <span className={styles.icon}>🏝️</span>
          </div>
        </div>
        <div className={styles.settingsIcons}>
          <span className={styles.icon}>⚙️</span>
          <span className={styles.icon}>🔊</span>
          <span className={styles.icon} onClick={handleOpenModal}>❔</span>
        </div>
      </div>
      <div className={styles.startButtonBox}>
        <button className={styles.startButton} onClick={handleStart}>スタート</button>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}


