"use client";

import React, { useState, useRef, useEffect } from "react";
import socket from "../socket";
import styles from "../styles/artist.module.css";
import { useRouter } from "next/navigation";

export default function Artist() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineWidth, setLineWidth] = useState(10);
  const [color, setColor] = useState("#000000");
  const [timer, setTimer] = useState(10);
  const [theme, setTheme] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isEraserActive, setIsEraserActive] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [welcomePopupVisible, setWelcomePopupVisible] = useState(true);
  const [error, setError] = useState(""); // エラーメッセージ用の状態を追加
  const router = useRouter();
  
  const [roomNumber, setRoomNumber] = useState("");

  useEffect(() => {
    const storedRoom = sessionStorage.getItem("roomNumber");
    if(storedRoom) {
      setRoomNumber(storedRoom);
    } else {
      console.error("ルーム番号が見つかりません");
      setError("ルームが見つかりません");
    }
  }, []);

  const getMousePosition = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };


  useEffect(() => {
    if (!socket.connected) {
      socket.connect(); // ソケット接続を確立
    }

    // ソケット接続エラーを監視
    socket.on("connect_error", () => {
      setError("サーバーへの接続に失敗しました。");
    });

    // クリーンアップ
    return () => {
      socket.off("connect_error");
    };
  }, []);

  const handleSendClick = () => {
    if(!theme || theme.trim() === "") {
      setError("お題入力して〜");
      return;
    }
            if(!roomNumber) {
              console.error("room number not found");
              setError("ルームが見つかりません");
              return;
            }

        // お題送信
        socket.emit("sendTheme", { roomNumber, theme }, (response) => {
          console.log("サーバーからのレスポンス:", response);

          if (response.success) {
            console.log("お題が送信されました：", theme);
            setError(""); 
          } else {
            console.error("お題の送信に失敗:", response.message);
            setError(response.message || "お題の送信に失敗しました。");
          }
        });
    };

  useEffect(() => {
    if (isTimerRunning && timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [isTimerRunning, timer]);

  useEffect(() => {
    if (timer === 0) {
      setIsTimerRunning(false);
      setCountdown("時間切れ！");
      setTimeout(() => {
        setCountdown(null);
      }, 3000);
    }
  }, [timer]);

  useEffect(() => {
    // コンポーネントのロード時にウェルカムポップアップを 3 秒間表示します
    const timeout = setTimeout(() => {
      setWelcomePopupVisible(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    socket.on("assignRole", ({ role }) => {
      console.log("新しい役割:", role);
      if(role === "artist") {
        router.push("/artist");
      } else {
        router.push("/answer");
      }
    });

    socket.on("forceTransition", ()=> {
      console.log("回答者が終了したため、自動遷移");
      router.push("/answer");
    });

    return () => {
      socket.off("assignRole");
      socket.off("forceTransition")
    };
  }, []);

  const startCountdown = () => {
    let counter = 3;
    setCountdown(counter);

    const countdownInterval = setInterval(() => {
      counter -= 1;
      if (counter > 0) {
        setCountdown(counter);
      } else {
        clearInterval(countdownInterval);
        setCountdown("Start!");
        setTimeout(() => {
          setCountdown(null);
          setIsTimerRunning(true);
        }, 1000);
      }
    }, 1000);
  };

  const startDrawing = (e) => {
    if (!isTimerRunning) return;
    const { x, y } = getMousePosition(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || !isTimerRunning) return;
    const { x, y } = getMousePosition(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.strokeStyle = isEraserActive ? "#ffffff" : color; // 消しゴムの場合は背景色
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleStart = () => {
    setIsPopupVisible(true);
  };

  const handlePopupOK = () => {
    startGame();
  };

  const handlePopupCancel = () => {
    setIsPopupVisible(false);
    setTheme(""); // Reset the theme
  };

  const startGame = () => {
    setIsPopupVisible(false);
    startCountdown();
  };

  return (
    <div className={styles.container}>
      {welcomePopupVisible && (
        <div className={styles.welcomePopup}>
          <p>あなたは絵師です！ 🎨</p>
        </div>
      )}

      <h1 className={styles.title}>お題を描こう！</h1>

      <div className={styles.controls}>
        <input
          type="text"
          className={styles.themeInput}
          placeholder="お題を決めよう"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        />
        <button className={styles.startButton} onClick={handleStart}>
          スタート
        </button>
      </div>

      {isPopupVisible && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <p>本当にこのお題でいいですか？</p>
            <button className={styles.okButton} onClick={() => { handlePopupOK(); handleSendClick(); }}>
              OK
            </button>
            <button className={styles.cancelButton} onClick={handlePopupCancel}>
              キャンセル
            </button>
          </div>
        </div>
      )}

      {countdown && (
        <div className={styles.countdown}>
          <p>{countdown}</p>
        </div>
      )}

      <div className={styles.main}>
        <div className={styles.canvasContainer}>
          <canvas
            ref={canvasRef}
            width={800}
            height={550}
            className={styles.canvas}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>

        <div className={styles.palette}>
          <div className={styles.timer}>残り: {timer} 秒</div>

          <div className={styles.colors}>
            {["#000000", "#ff0000", "#0000ff", "#ffff00", "#00ff00", "#ff00ff", "#00ffff", "#808080", "#ffffff", "#ffa500"].map(
              (col) => (
                <button
                  key={col}
                  className={`${styles.colorButton} ${color === col && !isEraserActive ? styles.selected : ""}`}
                  style={{ backgroundColor: col }}
                  onClick={() => {
                    setIsEraserActive(false);
                    setColor(col);
                  }}
                />
              )
            )}
          </div>

          <div className={styles.sizes}>
            {[10, 20, 30, 40].map((size) => (
              <button
                key={size}
                className={`${styles.sizeButton} ${lineWidth === size ? styles.selected : ""}`}
                style={{
                  width: size * 3 + "px",
                  height: size * 3 + "px",
                }}
                onClick={() => setLineWidth(size)}
              />
            ))}
          </div>

          <button
            className={styles.clearButton}
            onClick={() => {
              setIsEraserActive(true);
            }}
          >
            消しゴム
          </button>
          <button className={styles.clearButton} onClick={clearCanvas}>
            全消し
          </button>
        </div>
      </div>
    </div>
  );
}