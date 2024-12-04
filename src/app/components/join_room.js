import React from "react";
import styles from "../styles/joinRoom.module.css";

const JoinRoom = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ルーム番号を入力して下さい！</h1>
      <div className={styles.inputContainer}>
        <input type="text" placeholder="777.." className={styles.input} />
        <button className={styles.joinButton}>参加</button>
      </div>
    </div>
  );
};

export default JoinRoom;
