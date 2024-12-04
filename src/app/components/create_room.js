import React from "react";
import styles from "../styles/createRoom.module.css";

const CreateRoom = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ルーム番号を決めて下さい！</h1>
      <div className={styles.inputContainer}>
        <input type="text" placeholder="777.." className={styles.input} />
        <button className={styles.createButton}>作成</button>
      </div>
    </div>
  );
};

export default CreateRoom;
