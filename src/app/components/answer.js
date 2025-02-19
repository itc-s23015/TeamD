"uses client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { calculateScore, resetScore, getRoundScore, resetRound, getCurrentRound } from "./score";
import styles from "../styles/answer.module.css";
import socket from "../socket";

const Answer = () => {
  const router = useRouter();
  const [answer, setAnswer] = useState(""); 
  const [lives, setLives] = useState(5); // ライフ
  const [isCorrect, setIsCorrect] = useState(false);
  const [message, setMessage] = useState(""); // メッセージ表示用
  const [showMinusOne, setShowMinusOne ] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [welcomePopupVisible, setWelcomePopupVisible] = useState(true);

const [roomNumber, setRoomNumber] = useState("");

  useEffect(() => {
    // コンポーネントのロード時にウェルカムポップアップを 3 秒間表示します
    const timeout = setTimeout(() => {
      setWelcomePopupVisible(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const storedRoom = sessionStorage.getItem("roomNumber");
    if(storedRoom) {
      setRoomNumber(storedRoom);
    } else {
      console.error("ルーム番号が見つかりません");
      setMessage("room not found")
    }
  }, []);

  useEffect(() => {
    if(!socket.connected)socket.connect();
  // お題を受信
  // socket.on("themeReceived", ({ theme }) => {
  const themeHandler = ({ theme }) => {
    console.log(`受信したお題: ${theme}`);
    setCorrectAnswer(theme);
  };

  // サーバーから回答の結果を受信
  // socket.on("answerResult", ({ correct }) => {
  const answerHandler = ({ correct }) => {
    if (correct) {
      handleCorrectAnswer();
    } else {
      handleIncorrectAnswer();
    }
  };

  socket.on("themeReceived", themeHandler);
  socket.on("answerResult", answerHandler);

  return () => {
    socket.off("themeReceived", themeHandler);
    socket.off("answerResult", answerHandler);
  };
}, []);

  // 仮の回答
  // const correctAnswer = "てっくけつあるこあとるす";

  const handleCorrectAnswer = () => {
    const timeTaken = Date.now() - startTime;
    const score = calculateScore(timeTaken, attempts, correctAnswer);
    setMessage(`正解！得点: ${score}`);
    setIsCorrect(true);

    setTimeout(() => {
      setMessage("");
    }, 1000);
  };

  // 正解の場合
    // if (answer.trim() === correctAnswer) {
    //   correctScore(attempts);
    //   setIsCorrect(true);
    //   return;
    // };

    //不正解の場合
  const handleIncorrectAnswer = () => {
    setLives((prev) => {
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

const handleSubmit = (e) => {
  e.preventDefault();

  if(!answer.trim() || isCorrect || lives <= 0) return;
  setAttempts((prev) => prev + 1);

  console.log(`送信する回答：${answer}, ルーム番号：${roomNumber}`);

  socket.emit("submitAnswer", { roomNumber, answer });
}

const handleNextRound = () => {
  console.log("次のラウンドを開始します");
  socket.emit("roundOver", { roomNumber });

  setTimeout(() => {
    router.push("/artist");
  }, 2000);
}

useEffect(() => {
  if (isCorrect || lives <= 0) {
    setTimeout(handleNextRound, 2000);
  }
}, [isCorrect, lives]);

  const handleReset = () => {
    resetScore();
    setIsCorrect(false);
    setLives(5);
    setAttempts(0);
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