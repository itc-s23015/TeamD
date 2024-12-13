"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client"; // socket.io-client をインポート
import styles from "../styles/joinRoom.module.css";

const JoinRoom = () => {
  const [roomNumber, setRoomNumber] = useState("");
  const [error, setError] = useState(""); // エラーメッセージ用の状態
  const router = useRouter();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // socketインスタンスを作成
    const socketInstance = io("http://localhost:4000"); // サーバーのURLを指定
    setSocket(socketInstance);

     // ソケット接続のエラーハンドリング
    socketInstance.on("connect_error", (error) => {
      setError("ソケット接続に失敗しました。");
    });

    // コンポーネントのクリーンアップ時にソケットを切断
    return () => {
      if (socketInstance) {
        socketInstance.off("roomJoined"); // イベントのクリーンアップ
        socketInstance.disconnect();
      }
    };
  }, []);

  const handleJoinClick = () => {
    if (/^\d{3}$/.test(roomNumber)) {
      if (socket) {
        socket.emit("joinRoom", roomNumber); // サーバーにルーム参加を送信
        router.push(`/wait?room=${roomNumber}`); // 待機画面へ遷移
      } else {
        setError("ソケット接続が確立されていません。");
      }
    } else {
      setError("ルーム番号は3桁の数字で入力してください");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ルーム番号を入力して下さい！</h1>
      <div className={styles.inputContainer}>
        <input
          type="text"
          placeholder="777.."
          className={styles.input}
          value={roomNumber}
          onChange={(e) => setRoomNumber(e.target.value)}
        />
        <button className={styles.joinButton} onClick={handleJoinClick}>
          参加
        </button>
      </div>
      {error && <div className={styles.error}>{error}</div>} {/* エラーメッセージの表示 */}
    </div>
  );
};

export default JoinRoom;
