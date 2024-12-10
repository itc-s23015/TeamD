// components/WaitUI.tsx
import React, { useEffect, useState } from 'react';
import styles from '../styles/wait.module.css';

const WaitUI = () => {
  const [foundOpponent, setFoundOpponent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFoundOpponent(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.container}>
      {foundOpponent ? (
        <div className={styles.messageBox2}>
          対戦相手が見つかりました！
        </div>
      ) : (
        <div className={styles.messageBox}>
          待機中...
          <div className={styles.bubbleContainer}>
            <div className={styles.bubbleLarge}></div>
            <div className={styles.bubbleMedium}></div>
            <div className={styles.bubbleSmall}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaitUI;
