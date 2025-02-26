const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { default: socket } = require('./socket');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000', // クライアントのURLを環境変数で設定
    methods: ['GET', 'POST'],
  },
});

let rooms = {}; // ルーム番号ごとの接続情報

io.on('connection', (socket) => {
  console.log('新しいユーザーが接続しました:', socket.id);

  // ルーム作成
  socket.on('createRoom', (roomNumber, callback) => {
    console.log(`ユーザー ${socket.id} が部屋 ${roomNumber} を作成`);

    // ユーザーをマップで管理
    const users = new Map();

    // 部屋がすでに存在する場合、エラーメッセージを返す
    if (rooms[roomNumber]) {
      console.log(`部屋 ${roomNumber} はすでに存在するので、違う部屋を使ってね！`);
      callback({ success: false, message: 'この番号は現在使用できません！' });
      return;
    }

    // 部屋が存在しなければ作成
    users.set(socket.id, 'create');

    // ユーザーをルームに追加（この時点では対戦相手を待つ状態）
    rooms[roomNumber] = users;

    console.log(`現在の部屋情報:`, rooms);

    // 部屋のユーザー数が1人なら対戦相手を待機する
    socket.emit('waitingForOpponent', { message: '対戦相手を待っています...' });

    callback({ success: true });
  });

  // ルームに参加する
  socket.on('joinRoom', (roomNumber, callback) => {
    console.log(`ユーザー ${socket.id} が部屋 ${roomNumber} に参加`);

    // 部屋が存在すれば参加
    if (rooms[roomNumber] && !(rooms[roomNumber].size >= 2)) {
      rooms[roomNumber].set(socket.id, 'join');
      socket.join(roomNumber);

      console.log(`部屋 ${roomNumber} に参加したユーザー:`, rooms);

      callback({ success: true });
    } else if (rooms[roomNumber] && rooms[roomNumber].size == 2) {
      console.log('ただいま、このルームは満員なので、参加できません！')
      callback({ success: false, message: 'このルームは満員です！' })
    } else {
      console.log('指定した部屋がないんゴ...')
      callback({ success: false, message: '指定された部屋が存在しません。' });
    }
  });

  // 相手がくるまで待機させる
  socket.on('ready', (roomNumber, callback) => {
    console.log(`ユーザー ${socket.id} が部屋 ${roomNumber} で待機しています`);

    if (rooms[roomNumber].get(socket.id) === 'create' || rooms[roomNumber].get(socket.id) === 'join') {
      rooms[roomNumber].set(socket.id, 'ready');
    };

    console.log('準備が完了しました！');
    console.log(`現在の部屋情報:`, rooms);

    const key_array = rooms[roomNumber].keys().toArray()

    // 部屋のユーザー数が2人ならマッチングを開始
    if (rooms[roomNumber].get(socket.id) === 'ready' && rooms[roomNumber].size === 2) {
      console.log(`部屋 ${roomNumber} で対戦相手が見つかりました！`);

      // 両方のユーザーに「対戦相手が見つかりました」イベントを送信
      io.to(key_array[0]).emit('opponentFound', { roomNumber });
      io.to(key_array[1]).emit('opponentFound', { roomNumber });

      // ランダムに役割を割り当て
      const roles = ['artist', 'answer'];
      const randomIndex = Math.floor(Math.random() * 2) % roles.length;
      const player1 = roles[randomIndex];
      const player2 = roles[(randomIndex + 1) % 2];


      io.to(key_array[0]).emit('assignRole', { role: player1 });
      io.to(key_array[1]).emit('assignRole', { role: player2 });

    } else {
      // 1人目が参加したばかりのユーザーには待機メッセージ
      socket.emit('waitingForOpponent', { message: '対戦相手を待っています...' });
    }
  });


  // ユーザーが切断された場合の処理
  socket.on('disconnect', () => {
    console.log(`ユーザー ${socket.id} が切断されました`);

    for (const roomNumber in rooms) {
      if (rooms[roomNumber].has(socket.id)) {
        rooms[roomNumber].delete(socket.id);
        console.log(`部屋 ${roomNumber} からユーザー ${socket.id} を削除しました`);

        // 部屋が空になった場合は削除
        if (rooms[roomNumber].size === 0) {
          delete rooms[roomNumber];
          console.log(`部屋 ${roomNumber} が空になったため削除されました`);
        }
      }
    }

    console.log(`切断後の部屋情報:`, rooms);
  });
});

socket.on('answer', data => {
  console.log('answer_log');
  rooms.filter(s => s.id !== socket.id).forEach(s => {
    s.emit('answer', data);
  });
})

socket.on('offer', data => {
  console.log('offer_log');
  rooms.filter(s => s.id !== socket.id).forEach(s => {
    s.emit('offer', data);
  });
})

socket.on('ice-candidate', data => {
  console.log('ice-candidate_log');
  rooms.filter(s => s.id !== socket.id).forEach(s => {
    s.emit('ice-candidate', data);
  });
})



const PORT = process.env.PORT || 4000; // 環境変数を使用してポートを設定
server.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動しました`);
});