"use client";

import React from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/createRoom.module.css";

const CreateRoom = () => {
  const router = useRouter();

  const handleCreateClick = () => {
    router.push("/wait"); // ボタンを押したら /wait に画面遷移
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ルーム番号を決めて下さい！</h1>
      <div className={styles.inputContainer}>
        <input type="text" placeholder="777.." className={styles.input} />
        <button className={styles.createButton} onClick={handleCreateClick}>
          作成
        </button>
      </div>
    </div>
  );
};

export default CreateRoom;
