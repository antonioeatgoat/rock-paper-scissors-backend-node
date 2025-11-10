const API_BASE_URL = 'http://localhost:3000';
const WS_URL = 'http://localhost:3000';

document.addEventListener("DOMContentLoaded",  main);

function main() {
  attachEventListeners();
}

// Attach event listeners after rendering
function attachEventListeners() {
  // const nicknameInput = document.getElementById('nickname-input');
  const submitNicknameBtn = document.getElementById('submit-nickname-btn');

  if (submitNicknameBtn) {
    submitNicknameBtn.addEventListener('click', () => {
      void handleNicknameSubmit(); // explicitly ignore the returned Promise
    });
  }

  const joinGameBtn = document.getElementById('join-game-btn');
  if (joinGameBtn) {
    joinGameBtn.addEventListener('click', handleJoinGame);
  }
}

// Handle nickname submission
async function handleNicknameSubmit() {
  const input = document.getElementById(
    'nickname-input',
  );
  const nickname = input?.value?.trim();

  if (!nickname) {
    console.log('No nickname');
  }

  try {
    const response = await fetch(API_BASE_URL + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: nickname }),
    });

    const data = await response.json();
    console.log(data);
    // state.nickname = nickname;
    // state.sessionId = data.sessionId;
    // state.screen = 'lobby';
    // render();
  } catch (error) {
    console.error('Error logging in:', error);
  }
}

// Handle joining a game
function handleJoinGame() {
  initializeWebSocket();
}

// Initialize WebSocket connection
// function initializeWebSocket(gameId) {
function initializeWebSocket() {
  const socket= io(WS_URL);

  console.log('Connecting to playing rooms');

  socket.on('connect', function () {
    console.debug('WebSocket connected');
  });

  socket.on('waiting_for_opponent', function () {
    console.debug('Waiting for opponent');
  });

  socket.on('game_started', function (data) {
    console.log('Game joined');
    console.log(data);
  });

  socket.on('game_rejoined', function (data) {
    console.log('Game recovered');
    console.log(data);
  });

  socket.on('game_finished', function (data) {
    console.log('Game finished');
    console.log(data);
  });

  socket.on('error', function (data) {
    console.error('WebSocket error:', data);
  });

  socket.on('disconnect', function () {
    console.log('WebSocket disconnected');
  });

  // state.ws = ws;

  const moveBtns = document.querySelectorAll('.move-btn');
  moveBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const move = btn.getAttribute('data-move');
      // handleMoveSelect(socket, move);
      console.log('Sending move');
      socket.emit('make_move', move);
    });
  });

  const playAgainBtn = document.getElementById('play-again');

  if (playAgainBtn) {
    playAgainBtn.addEventListener('click', function () {
      console.log('Sending play again');
      socket.emit('play_again');
    });
  }

  const exitGameButton = document.getElementById('exit-game');

  if (exitGameButton) {
    exitGameButton.addEventListener('click', function () {
      console.log('Sending exit game');
      socket.emit('exit_game');
    });
  }
}
