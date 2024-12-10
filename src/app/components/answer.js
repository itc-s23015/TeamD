import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/answer.module.css";

const Answer = () => {
  const router = useRouter();
  const [answer, setAnswer] = useState(""); 
  const [lives, setlives] = useState(5); // ライフ
  const [isCorrect, setIsCorrect] = useState(false);
  const [message, setMessage] = useState(""); // メッセージ表示用

  // 仮の回答
  const correctAnswer = "test";

  const handleSubmit = (e) => {
    e.preventDefault();
  

  if (isCorrect || lives <= 0) return;

  // 正解の場合
  if (answer.trim() === correctAnswer) {
    setMessage("正解!");
    setIsCorrect(true);
    return
  }

    //不正解の場合
    setlives((prev) => {
      const lives = Math.max(prev - 1, 0);
      setMessage(lives > 0 ? "間違いです！": "ライフがなくなりました");
      return lives;
    });
  };


  return (
    <div className={styles.container}>
      <div className={styles.messageContainer}>
        {message && <p className={styles.message}>{message}</p>}
      </div>
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
            disabled={isCorrect || lives <= 0} // 正解、ライフ０で入力不可
          />

          <button type="submit" className={styles.button} disabled={isCorrect || lives <= 0}>
            回答
          </button>
        </div>
      </form>
      </div>
  );
};

export default Answer;
