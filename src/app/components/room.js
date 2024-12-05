import React from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/room.module.css";

const Room = () => {
  const router = useRouter();

  const handleCreateClick = () => {
    router.push("/create-room");
  };

  const handleJoinClick = () => {
    router.push("/join-room");
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ルーム番号</h1>
      <div className={styles.buttonContainer}>
        <button className={styles.createButton} onClick={handleCreateClick}>
          作成
        </button>
        <span className={styles.orText}>or</span>
        <button className={styles.joinButton} onClick={handleJoinClick}>
          参加
        </button>
      </div>
    </div>
  );
};

export default Room;
