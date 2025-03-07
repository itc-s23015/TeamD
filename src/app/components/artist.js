'use client';

import { useState, useRef, useEffect } from "react";
import styles from "../styles/artist.module.css";
import socket from "../socket";
import "webrtc-adapter";

export default function Artist() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineWidth, setLineWidth] = useState(10);
  const [color, setColor] = useState("#000000");
  const [timer, setTimer] = useState(30);
  const [topic, setTopic] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isEraserActive, setIsEraserActive] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [welcomePopupVisible, setWelcomePopupVisible] = useState(true);

  useEffect(() => {
    const servers = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        {
          urls: "turn:34.16.13.218:3478",
          username: "teamD",
          credential: "irasutogame"
        }
      ]
    }

    // WebRTC 追加
    const canvas = document.getElementById('myCanvas')
    const video = document.getElementById('display')


    const signalingServer = socket
    const peerConnection = new RTCPeerConnection(servers);
    const stream = canvas.captureStream(30);
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream))

    // actionOffer();

    // function actionOffer() {
      peerConnection.createOffer()
        .then(offer => {
          return peerConnection.setLocalDescription(offer);
        })
        .then(() => {
          signalingServer.emit('offer', peerConnection.localDescription)
        })
        .catch(err => console.log('Error creating offer: ', err))
    // }

    peerConnection.onicecandidate = e => {
      if (e.candidate) {
        signalingServer.emit('ice-candidate', e.candidate)
      }
    }

    peerConnection.ontrack = async e => {
      if (video.srcObject !== e.streams[0]) {
        video.srcObject = e.streams[0]
        if (video.paused) {
          await video.play()
          console.log('video is paused');
        }
      }
    }

    signalingServer.on('answer', data => {
      const remoteAnswer = new RTCSessionDescription(data)
      peerConnection.setRemoteDescription(remoteAnswer)
        .catch(err => console.log('Error setting remote answer: ', err))
    })


    signalingServer.on('offer', data => {
      console.log('offer', data)
      const remoteOffer = new RTCSessionDescription(data)
      peerConnection.setRemoteDescription(remoteOffer)
        .then(() => {
          return peerConnection.createAnswer()
        })
        .then(answer => {
          return peerConnection.setLocalDescription(answer)
        })
        .then(() => {
          signalingServer.emit('answer', peerConnection.localDescription)
        })
        .catch(err => console.log('Error creating or setting answer: ', err))
    })

    signalingServer.on('ice-candidate', data => {
      console.log('ice-candidate: ', data)
      peerConnection.addIceCandidate(new RTCIceCandidate(data))
        .catch(err => console.log('Error adding ICE candidate: ', err))
    })

  });

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
    setTopic(""); // Reset the topic
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
          className={styles.topicInput}
          placeholder="お題を決めよう"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <button className={styles.startButton} onClick={handleStart}>
          スタート
        </button>
      </div>

      {isPopupVisible && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <p>本当にこのお題でいいですか？</p>
            <button className={styles.okButton} onClick={handlePopupOK}>
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
          <canvas id="myCanvas"
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