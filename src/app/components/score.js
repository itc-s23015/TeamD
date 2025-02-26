let roundScores = [0, 0, 0];
let currentRound = 0;

const BASE_POINTS = 10;

// 回答時間を元にスコアを計算
const SPEED_MULTIPLIERS = [
    { time: 15000, multiplier: 1.5 },
    { time: 30000, multiplier: 1.25 },
    { time: 45000, multiplier: 1.0 },
    { time: Infinity, multiplier: 0.9 },
];

const getSpeedMultiplier = (timeTaken) => {
    for (const { time, multiplier } of SPEED_MULTIPLIERS) {
        if (timeTaken <= time) return multiplier;
    }
    return 0.9;
}


// 回答回数を元にスコアを計算
const ATTEMPS_MULTIPLIERS = [1.5, 1.25, 1.0, 0.9, 0.0];

const getAttemptsMultiplier = (attempts) => {
    return ATTEMPS_MULTIPLIERS[attempts - 1] || 0.0;
}


// お題の長さを元にスコアを計算
const DIFFICULTY_MULTIPLIERS = [
    { length: 11, multiplier: 2.0 },
    { length: 9, multiplier: 1.5 },
    { length: 7, multiplier: 1.25 },
    { length: 5, multiplier: 1.0 },
    { length: 1, multiplier: 1.0 },
]

const getDifficultyMultiplier = (questionLength) => {
    for (const { length, multiplier } of DIFFICULTY_MULTIPLIERS) {
        if (questionLength >= length) return multiplier;
    }
    return 1.0;
}

// スコア計算
export const calculateScore = (timeTaken, attempts, question) => {
    const speedMultiplier = getSpeedMultiplier(timeTaken);
    const attemptsMultiplier = getAttemptsMultiplier(attempts);
    const difficultyMultiplier = getDifficultyMultiplier(question.length);

    const roundScore = BASE_POINTS * speedMultiplier * attemptsMultiplier * difficultyMultiplier;
    roundScores[currentRound] = Math.floor(roundScore);// 現在のラウンドのスコアを保存
    return Math.floor(roundScore); //floorで切り捨て
}

// 特定ラウンドのスコアを取得
export const getRoundScore = (round) => roundScores[round] || 0;

// 総スコア取得
export const getTotalScore = () => roundScores.reduce((total, score) => + score, 0);

// ポイントをリセットし次のラウンドに進む
export const resetRound = () => {
    if (currentRound < 2) {
        roundScores[currentRound] = 0;
        currentRound++;
    }
};

// 現在のラウンド番号を取得
export const getCurrentRound = () => currentRound;

// スコア全体をリセット
export const resetScore = () => {
    roundScores = [0, 0, 0];
    currentRound = 0;
}