import React from "react";
import styles from '../styles/modal.module.css';

const Modal = ({ isOpen, onClose }) => {
    if(!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalContent}>
                    <h2>ー伝言ゲームの概要ー</h2>
                    <p>
                        この伝言ゲームは、二人のプレイヤーが交互に「お題」を出し合いながら、絵でそのお題を伝えるゲームです。
                    </p>
                    <ul>
                        <li>ゲームは二人でプレイします</li>
                        <li>絵師が「お題」を決め、お題に沿った絵を描きます🎨</li>
                        <li>回答者はその絵をみて「お題」を当てます</li>
                    </ul>
                    <p>あなたの想像力を働かせて、相手にお題を伝えよう！</p>
                </div>
            </div>
        </div>    
    );
};

export default Modal;