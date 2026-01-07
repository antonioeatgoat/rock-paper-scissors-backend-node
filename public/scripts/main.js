const API_BASE_URL = '';
const WS_URL = '';

let state = {
  screen: 'login',
  socket: null,
  nickname: '',
  opponentNickname: '',
};

function render() {
  // Render Screen
  _hideByClass('.screen');
  _showById('screen-' + state.screen);

  // Render current nickname
  document
    .querySelectorAll('.current-nickname')
    .forEach((element) => (element.textContent = state.nickname));

  // Render opponent nickname
  document
    .querySelectorAll('.opponent-nickname')
    .forEach((element) => (element.textContent = state.opponentNickname));

  if (state.screen === 'login' || state.nickname === '') {
    _hideById('game-header');
  } else {
    _showById('game-header');
  }

  if (state.screen === 'playing') {
    _showById('exit-game-btn');
  } else {
    _hideById('exit-game-btn');
  }
}

document.addEventListener('DOMContentLoaded', main);

function main() {
  document.getElementById('signup-form').addEventListener('submit', (event) => {
    event.preventDefault();
    signUp();
  });
  document
    .getElementById('submit-nickname-btn')
    .addEventListener('click', signUp);
  document.getElementById('join-game-btn').addEventListener('click', findGame);
  document
    .getElementById('play-again-btn')
    .addEventListener('click', playAgain);
  document.getElementById('exit-game-btn').addEventListener('click', exitGame);
  document.querySelectorAll('.move-btn').forEach((button) => {
    button.addEventListener('click', function () {
      makeMove(this.dataset.move);
    });
  });

  _loadStoredState();

  if (state.nickname === '' || state.screen === 'login') {
    _resetState();
    _changeScreen('login');
    return;
  }

  const previousScreen = state.screen;
  _changeScreen('loading');
  _refreshPreviousStatus(previousScreen);
}

async function _refreshPreviousStatus(previousScreen) {
  const response = await fetch(API_BASE_URL + '/games/current-game', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await response.json();

  if (response.status !== 200) {
    _resetState();
    _changeScreen('login');
    return;
  }

  if (data.status === 'idle') {
    _changeScreen('lobby');
    return;
  }

  _initializeWebSocket();

  const status = data?.status ?? '';

  if (status === 'waiting') {
    _changeScreen('waiting');
  } else if (status === 'playing') {
    _renderPlayingGame(data);
  } else {
    _renderFinishedGame(data);
  }
}

// Handle nickname submission
async function signUp() {
  _hideRegisterError();
  const inputEl = document.getElementById('nickname-input');
  const nickname = inputEl?.value?.trim();

  if (!nickname) {
    _displayRegisterError('Nickname cannot be empty.');
    return;
  }

  try {
    const response = await fetch(API_BASE_URL + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: nickname }),
    });

    const data = await response.json();

    if (response.status !== 200) {
      if ('message' in data) {
        _displayRegisterError(data.message);
      }
      return;
    }

    state.nickname = nickname;
    _changeScreen('lobby');
  } catch (error) {
    console.error('Error logging in:', error);
  }
}

// Handle joining a game
function findGame() {
  if (!state.socket) {
    _initializeWebSocket();
  }

  _emit('search_game');
}

function makeMove(move) {
  if (state.screen !== 'playing') {
    console.debug('Trying to send `make_move` but current screen is wrong.');
    return;
  }

  _renderMoveSelected(move);

  _emit('make_move', move);
}

function playAgain() {
  if (state.screen !== 'game-finished') {
    console.warn('Trying to send `play_again` but current screen is wrong.');
    return;
  }

  if (!state.socket) {
    _initializeWebSocket();
  }

  _emit('play_again');
}

function exitGame() {
  if (state.screen !== 'playing') {
    console.warn('Trying to send `exit_game` but current screen is wrong.');
    return;
  }

  _changeScreen('lobby');

  console.debug('Sending `exit_game` event.');
  state.socket.emit('exit_game');
}

function _initializeWebSocket() {
  const socket = io(WS_URL);
  state.socket = socket;

  console.debug('Connecting to playing rooms');

  socket.on('connect', function () {
    console.debug('WebSocket connected');
  });

  socket.on('waiting_for_opponent', function () {
    console.debug('Waiting for opponent');
    _changeScreen('waiting');
  });

  socket.on('game_joined', function (data) {
    console.debug('Game joined');
    console.debug(data);

    _renderPlayingGame(data);
  });

  socket.on('game_finished', function (data) {
    console.debug('Game finished');
    console.debug(data);

    _hideByClass('.game-result');

    _updateTextById('your-move', data?.yourMove ? data.yourMove : 'Not played');
    _updateTextById(
      'opponent-move',
      data?.opponentMove ? data?.opponentMove : 'Not played',
    );

    const resultElMap = {
      winner: ['game-result-won', 'game-result-moves'],
      opponent_left: ['game-result-won', 'game-result-opponent-left'],
      loser: ['game-result-lost', 'game-result-moves'],
      tie: ['game-result-tie', 'game-result-moves'],
    };

    if (data?.result in resultElMap) {
      for (const elId of resultElMap[data?.result]) {
        console.log('showing by id ', elId);
        _showById(elId);
      }
    }

    _changeScreen('game-finished');
  });

  socket.on('disconnect', function () {
    state.socket = null;
    console.debug('WebSocket disconnected');
  });
}

function _changeScreen(screen) {
  state.screen = screen;
  _storeState();
  render();
}

function _cleanPlayingScreen() {
  _showById('moves-container');
  _hideById('chosen-move-container');
}

function _renderPlayingGame(data) {
  _cleanPlayingScreen();

  state.opponentNickname = data?.opponent ?? '';
  _changeScreen('playing');

  if (data?.yourMove) {
    _renderMoveSelected(data.yourMove);
  }
}

function _renderFinishedGame(data) {
  _updateTextById('your-move', data.yourMove);
  _updateTextById('opponent-move', data.opponentMove);

  _hideByClass('.game-result');

  if (data.draw === true) {
    _showById('game-result-tie');
  } else if (data.winner === true) {
    _showById('game-result-won');
  } else {
    _showById('game-result-lost');
  }

  _changeScreen('game-finished');
}

function _renderMoveSelected(move) {
  _hideById('moves-container');
  _updateTextById('chosen-move', move);
  _showById('chosen-move-container');
}

function _emit(event, data) {
  console.debug(`Sending '${event}' event.`);
  state.socket.emit(event, data);
}

function _storeState() {
  window.localStorage.setItem(
    'state',
    JSON.stringify({ screen: state.screen, nickname: state.nickname }),
  );
}

function _loadStoredState() {
  const storedState = JSON.parse(window.localStorage.getItem('state'));

  if (
    storedState instanceof Object &&
    'screen' in storedState &&
    'nickname' in storedState
  ) {
    state.screen = storedState.screen;
    state.nickname = storedState.nickname;
  }
}

function _resetState() {
  state = {
    screen: 'login',
    socket: null,
    nickname: '',
    opponentNickname: '',
  };
}

function _displayRegisterError(message) {
  const errorEl = document.querySelector('.error-message');
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
}

function _hideRegisterError() {
  const errorEl = document.querySelector('.error-message');
  errorEl.classList.add('hidden');
}

function _updateTextById(elementId, text) {
  const element = document.getElementById(elementId);

  if (!element) {
    console.error('Cannot select element', elementId);
    return;
  }

  element.textContent = text;
}

function _hideById(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.add('hidden');
  }
}

function _showById(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.remove('hidden');
  }
}

function _hideByClass(elementsClass) {
  document
    .querySelectorAll(elementsClass)
    .forEach((element) => element.classList.add('hidden'));
}

function _showByClass(elementsClass) {
  document
    .querySelectorAll(elementsClass)
    .forEach((element) => element.classList.remove('hidden'));
}
