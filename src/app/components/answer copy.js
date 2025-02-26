import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/answer.module.css";
import socket from "../socket";
import adapter from "webrtc-adapter";

const Answer = ({ peerConnection }) => {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const [lives, setLives] = useState(5);
  const [isCorrect, setIsCorrect] = useState(false);
  const [message, setMessage] = useState("");
  const [dataChannel, setDataChannel] = useState(null);
  const [welcomePopupVisible, setWelcomePopupVisible] = useState(true);
  const canvasRef = useRef(null);
  const correctAnswer = "test";

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
    //   peerConnection.createOffer()
    //     .then(offer => {
    //       return peerConnection.setLocalDescription(offer);
    //     })
    //     .then(() => {
    //       signalingServer.emit('offer', peerConnection.localDescription)
    //     })
    //     .catch(err => console.log('Error creating offer: ', err))
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

  useEffect(() => {
    const timeout = setTimeout(() => {
      setWelcomePopupVisible(false);
    }, 3000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!peerConnection) return;
    peerConnection.ondatachannel = (event) => {
      const receiveChannel = event.channel;
      setDataChannel(receiveChannel);
      receiveChannel.onmessage = (event) => {
        const image = new Image();
        image.src = event.data;
        image.onload = () => {
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          }
        };
      };
    };
  }, [peerConnection]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isCorrect || lives <= 0) return;

    if (answer.trim() === correctAnswer) {
      setMessage("正解!");
      setIsCorrect(true);
      return;
    }
    
    setLives((prev) => {
      const newLives = Math.max(prev - 1, 0);
      setMessage(newLives > 0 ? "間違いです！" : "You are died");
      return newLives;
    });
  };

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
      <div className={styles.videoContainer}>
        <video width={800} height={550} className={styles.video} id="display" playsInline autoPlay muted />
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
            disabled={isCorrect || lives <= 0}
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
