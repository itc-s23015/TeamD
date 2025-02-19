import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { calculateScore, resetScore, getRoundScore, resetRound, getCurrentRound } from "./score";
import styles from "../styles/answer.module.css";


const Answer = () => {
  const router = useRouter();
  const [answer, setAnswer] = useState(""); 
  const [lives, setlives] = useState(5); // ライフ
  const [isCorrect, setIsCorrect] = useState(false);
  const [message, setMessage] = useState(""); // メッセージ表示用
  const [showMinusOne, setShowMinusOne ] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [welcomePopupVisible, setWelcomePopupVisible] = useState(true);


  useEffect(() => {
    // コンポーネントのロード時にウェルカムポップアップを 3 秒間表示します
    const timeout = setTimeout(() => {
      setWelcomePopupVisible(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);


  // 仮の回答
  const correctAnswer = "てっくけつあるこあとるす";

  const correctScore = (attempts) => {
    const timeTaken = Date.now() - startTime;
    const score = calculateScore(timeTaken, attempts, correctAnswer);
    setMessage(`正解！得点: ${score}`);

    setTimeout(() => {
      setMessage("");
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (isCorrect || lives <= 0) return;

    setAttempts((prev) => prev + 1);

  // 正解の場合
    if (answer.trim() === correctAnswer) {
      correctScore(attempts);
      setIsCorrect(true);
      return;
    };

    //不正解の場合
    setlives((prev) => {
      const newlives = Math.max(prev - 1, 0);

      setShowMinusOne(true);
      setTimeout(() => setShowMinusOne(false), 1000);

      setMessage(newlives > 0 ? "間違いです！": "You are died");
       
      setTimeout(() => {
        setMessage("");
      }, 1000);
      return newlives;
    });
};

  const handleReset = () => {
    resetScore();
    setIsCorrect(false);
    setLives(5);
    setAttempts(0);
    setStartTime(Date.now());
    setAnswer("");
    setMessage("");
  }


  return (
    <div className={styles.container}>
      {welcomePopupVisible && (
        <div className={styles.welcomePopup}>
          <p>あなたは回答者です！ ✍</p>
        </div>
      )}
      <div className={styles.messageContainer}>
        {message && <p className={styles.message}>{message}</p>}
      </div>
      <h1>これは何でしょう？</h1>
      <div className={styles.imageWrapper}></div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.livesContainer}>
        <p className={styles.lives}>❤️x{lives}</p>
          {showMinusOne && <span className={styles.minusOne}>-1</span>}
        </div>  
        {/* <p>現在のラウンド: {getCurrentRound() + 1}</p> */}
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
        {/* <button onClick={handleReset}>Score reset</button> */}
        {/* <div>ラウンドスコア<strong>{getRoundScore(getCurrentRound())}</strong></div> */}

      </form>
      </div>
  );
};

export default Answer;
