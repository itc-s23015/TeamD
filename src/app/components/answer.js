import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/answer.module.css";

const Answer = () => {
  const router = useRouter();

  const [answer, setAnswer] = useState("");
  const [lives, setlives] = useState(5);
  
  // 本来の答えを入れるようにする
  const correctAnswer = "test";

  const handleSubmit = (e) => {
    e.preventDefault();
  

  if (lives <= 0) return;

  // 正解の場合
  if (answer.trim() === correctAnswer) {
    alert("正解!");
    setAnswer("")
    return
  }

    //不正解の場合
    setlives((prev) => {
      const lives = Math.max(prev - 1, 0);
      alert(lives > 0 ? "間違いです！": "ライフがなくなりました");
      return lives;
    });
    setAnswer("");
  };


  return (
    <div className={styles.container}>
      <h1>これは何でしょう？</h1>
      <div className={styles.imageWrapper}>
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <p className={styles.lives}>❤️x{lives}</p>
        <div className={styles.inputAndButton}>

          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
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
