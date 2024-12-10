import { useState } from "react";
import styles from "../styles/answer.css";

function Answer() {

  return (
    <div className={styles.container}>
      <h1>これは何でしょう？</h1>
      <div className={styles.imageWrapper}>
        <img src="" alt="クイズの問題" />
      </div>
      <form>
        <input
          type="text"
          placeholder="ひらがな・カタカナのみ入力可能"
          className={styles.input}
        />
        <button className={styles.button}>
          回答
        </button>
      </form>
      <p className={styles.lives}>❤️</p> 
    </div>
  );
}

export default Answer;
