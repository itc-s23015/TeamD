import React, { useState, useEffect } from 'react';
import styles from '../styles/result.module.css';
import { useRouter } from 'next/navigation';

const ResultBoard = () => {
  const router = useRouter(); 

  const [scores, setScores] = useState({
    player1: [0, 0, 0], // 初期値として3つのスコアを0で設定
    player2: [0, 0, 0],
  });

  const [bgm, setBgm] = useState(null); // BGMの状態管理

  const handleInputChange = (e, player, index) => {
    const value = parseInt(e.target.value, 10) || 0; // 数値に変換、無効な値は0
    const newScores = { ...scores }; // 状態のコピーを作成
    newScores[player][index] = value; // 対象のスコアを更新
    setScores(newScores); // 状態を更新
  };

  const calculateTotal = (player) =>
    scores[player].reduce((sum, score) => sum + score, 0);

  const handleStart = () => {
    SoundEffect(); // 効果音を再生
    if (bgm) {
      bgm.pause();
      bgm.currentTime = 0; // 再生位置をリセット
    }
    router.push('/'); // / ページに遷移
  };

  const SoundEffect = () => {
    const audio = new Audio('/audio/kettei18.mp3');
    audio.play();
  };

  const startBgm = () => {
    const bgmAudio = new Audio('/audio/BGM_Pop.mp3');
    bgmAudio.loop = true; // ループ再生
    bgmAudio.volume = 0.5; // 音量を50%に設定
    bgmAudio.play();
    setBgm(bgmAudio); // 状態にBGMを保存
  };

  useEffect(() => {
    // クリーンアップでBGMを停止
    return () => {
      if (bgm) {
        bgm.pause();
        bgm.currentTime = 0;
      }
    };
  }, [bgm]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>結果発表</h1>
      <div className={styles.result}>
        <div className={styles.player1}>1P</div>
        <div className={styles.winner}>
          {calculateTotal('player1') > calculateTotal('player2')
            ? '1Pの勝ち'
            : calculateTotal('player1') < calculateTotal('player2')
            ? '2Pの勝ち'
            : '引き分け'}
        </div>
        <div className={styles.player2}>2P</div>
      </div>

      <div className={styles.scores}>
        {[0, 1, 2].map((index) => (
          <div className={styles.row} key={index}>
            <input
              type="number"
              className={styles.input}
              value={scores.player1[index]}
              onChange={(e) => handleInputChange(e, 'player1', index)}
              placeholder="1P"
            />
            <input
              type="number"
              className={styles.input}
              value={scores.player2[index]}
              onChange={(e) => handleInputChange(e, 'player2', index)}
              placeholder="2P"
            />
          </div>
        ))}
      </div>

      <div className={styles.total}>
        <div className={styles.totalScore}>
          1Pの合計
          <span className={styles.points}>{calculateTotal('player1')}P</span>
        </div>
        <div className={styles.totalScore}>
          2Pの合計
          <span className={styles.points}>{calculateTotal('player2')}P</span>
        </div>
      </div>

      <div className={styles.backButton}>
        <button className={styles.startButton} onClick={startBgm}>
          BGMを再生
        </button>
        <button className={styles.backButton} onClick={handleStart}>
          戻る
        </button>
      </div>
    </div>
  );
};

export default ResultBoard;
