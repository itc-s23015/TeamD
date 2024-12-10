import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/answer.module.css";

const Answer = () => {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <h1>これは何でしょう？</h1>
      <div className={styles.imageWrapper}>
      </div>
      <form>
        <p className={styles.lives}>❤️x5</p>
        <div className={styles.inputAndButton}>

          <input
            type="text"
            placeholder="ひらがな・カタカナのみ入力可能"
            className={styles.input}
          />

          <button type="submit" className={styles.button}>
            回答
          </button>
        </div>
      </form>
      </div>
  );
};

export default Answer;
