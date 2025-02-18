"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import socket from "../socket"; // グローバルソケットをインポート
import styles from "../styles/wait.module.css";

const WaitUI = () => {
  const [foundOpponent, setFoundOpponent] = useState(false);
  const [roomNumber, setRoomNumber] = useState(null);
  const [role, setRole] = useState(null); // ユーザーの役割
  const [error, setError] = useState(""); // エラーメッセージ
  const router = useRouter();

  useEffect(() => {
    // URLクエリからルーム番号を取得
    const query = new URLSearchParams(window.location.search);
    const room = query.get("room");

    if (room) {
      setRoomNumber(room);
      sessionStorage.setItem("roomNumber", room);
    } else {
      setError("ルーム番号が見つかりません");
      return;
    }
    
      if (!socket.connected) {
        socket.connect(); // ソケット接続を確立
      }
      
      // 待機状態を伝える
      socket.emit("ready", room);

    // 対戦相手が見つかったときの処理
    socket.on("opponentFound", () => {
      setFoundOpponent(true);
    });

    // 役割を割り当てられたときの処理
    socket.on("assignRole", ({ role }) => {
      console.log('check time now!!')
      setRole(role);
      setTimeout(() => {
        const nextPage = role === "artist" ? "/artist" : "/answer";
        router.push(nextPage); // 役割に応じて遷移
      }, 2000); // 2秒後に遷移
    });

    // ソケット接続エラー
    socket.on("connect_error", () => {
      setError("サーバーへの接続に失敗しました。");
    });

    // クリーンアップ
    return () => {
      socket.off("ready");
      socket.off("opponentFound");
      socket.off("assignRole");
      socket.off("connect_error");
    };
  }, [router]);

  return (
    <div className={styles.container}>
      {error ? (
        <div className={styles.error}>{error}</div>
      ) : foundOpponent ? (
        <div className={styles.messageBox2}>対戦相手が見つかりました！</div>
      ) : (
        <div className={styles.messageBox}>
          待機中...
          {roomNumber && (
            <div className={styles.roomInfo}>ルーム番号: {roomNumber}</div>
          )}
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
