"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import styles from "../styles/wait.module.css";

let socket; // グローバルなソケットインスタンス

const WaitUI = () => {
  const [foundOpponent, setFoundOpponent] = useState(false);
  const [roomNumber, setRoomNumber] = useState(null);
  const [role, setRole] = useState(null);  // 役割 (artist or answer)
  const router = useRouter();

  useEffect(() => {
    // ソケットの初期化
    socket = io("http://localhost:4000");

    // URLクエリからルーム番号を取得
    const query = new URLSearchParams(window.location.search);
    const room = query.get("room");
    setRoomNumber(room);

    // ルームに参加
    if (room) {
      socket.emit("joinRoom", room); // `joinRoom` イベントでルーム参加
    }

    // 対戦相手が見つかったときの処理
    socket.on("opponentFound", () => {
      setFoundOpponent(true);

      // ユーザーの役割が決まった後に遷移する
      setTimeout(() => {
        const nextPage = role === 'artist' ? "/artist" : "/answer";
        router.push(nextPage);
      }, 2000);
    });

    // 役割を割り当てられる
    socket.on("assignRole", ({ role }) => {
      setRole(role);
    });

    // コンポーネントがアンマウントされたときにソケット接続を切断
    return () => {
      socket.disconnect();
    };
  }, [router, role]);

  return (
    <div className={styles.container}>
      {foundOpponent ? (
        <div className={styles.messageBox2}>対戦相手が見つかりました！</div>
      ) : (
        <div className={styles.messageBox}>
          待機中...
          {roomNumber && <div className={styles.roomInfo}>ルーム番号: {roomNumber}</div>}
          <div className={styles.bubbleContainer}>
            <div className={styles.bubbleLarge}></div>
            <div className={styles.bubbleMedium}></div>
            <div className={styles.bubbleSmall}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaitUI;
