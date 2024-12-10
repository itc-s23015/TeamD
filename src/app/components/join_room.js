"use client";

import React from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/joinRoom.module.css";

const JoinRoom = () => {
  const router = useRouter();

  const handleJoinClick = () => {
    router.push("/wait"); // ボタンを押したら /wait に画面遷移
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ルーム番号を入力して下さい！</h1>
      <div className={styles.inputContainer}>
        <input type="text" placeholder="777.." className={styles.input} />
        <button className={styles.joinButton} onClick={handleJoinClick}>
          参加
        </button>
      </div>
    </div>
  );
};

export default JoinRoom;
