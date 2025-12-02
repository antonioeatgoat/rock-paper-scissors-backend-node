const API_BASE_URL = '';
const WS_URL = '';

let state = {
  screen: 'login',
  socket: null,
  nickname: '',
  opponentNickname: '',
}

function render() {

  // Render Screen
  _hideByClass('.screen');
  _showById('screen-' + state.screen)

  // Render current nickname
  document.querySelectorAll('.current-nickname')
    .forEach(element => element.textContent = state.nickname);

  // Render opponent nickname
  document.querySelectorAll('.opponent-nickname')
    .forEach(element => element.textContent = state.opponentNickname);

  if (state.screen === 'login' || state.nickname === '') {
    _hideById('game-header');
  } else {
    _showById('game-header');
  }

  if (state.screen === 'playing') {
    _hideById('logout-btn');
    _showById('exit-game-btn');
  } else {
    _hideById('exit-game-btn');
    _showById('logout-btn');
  }
}

document.addEventListener("DOMContentLoaded",  main);

function main() {
  _loadStoredState()

  if (state.screen !== 'login' && state.screen !== 'lobby') {
    _initializeWebSocket();
  }

  render();
}

// Handle nickname submission
async function signUp() {
  _hideRegisterError()
  const inputEl = document.getElementById(
    'nickname-input',
  );
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
    _changeScreen('lobby')
  } catch (error) {
    console.error('Error logging in:', error);
  }
}

// Handle joining a game
function findGame() {
  if (!state.socket) {
    _initializeWebSocket();
  }
}

function makeMove(move) {
  if (state.screen !== 'playing') {
    console.debug('Trying to send `make_move` but current screen is wrong.');
    return;
  }

  _hideById('moves-container');
  _updateTextById('choosen-move', move);
  _showById('choosen-move-container');

  console.debug('Sending `make_move` event.');
  state.socket.emit('make_move', move);
}

function playAgain() {
  if (state.screen !== 'game-finished') {
    console.warn('Trying to send `play_again` but current screen is wrong.');
    return;
  }

  console.debug('Sending `play_again` event.');
  state.socket.emit('play_again');
}

// function exitGame() {
//   if (state.screen !== 'playing') {
//     console.warn('Trying to send `exit_Game` but current screen is wrong.');
//     return;
//   }
//
//   _changeScreen('lobby');
//
//   console.debug('Sending `exit_game` event.');
//   state.socket.emit('exit_game');
// }

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

  socket.on('game_started', function (data) {
    console.debug('Game joined');
    console.debug(data);

    _cleanPlayingScreen();

    state.opponentNickname = data?.opponent ?? '';
    _changeScreen('playing');
  });

  socket.on('game_rejoined', function (data) {
    console.debug('Game recovered');
    console.debug(data);

    // TODO Getting move selected if already done

    _cleanPlayingScreen();

    state.opponentNickname = data?.opponent ?? '';
    _changeScreen('playing');
  });

  socket.on('game_finished', function (data) {
    console.debug('Game finished');
    console.debug(data);

    _updateTextById('your-move', data.yourMove)
    _updateTextById('opponent-move', data.opponentMove)

    _hideByClass('.game-result')

    if (data.draw === true) {
      _showById('game-result-tie')
    } else if (data.winner === true) {
      _showById('game-result-won')
    } else {
      _showById('game-result-lost')
    }

    _changeScreen('game-finished');
  });

  socket.on('error', function (data) {
    console.error('WebSocket error:', data);

    if (data?.error === 'auth_error') {
      _resetState();
      _changeScreen('login');
    }
  });

  socket.on('disconnect', function () {
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
  _hideById('choosen-move-container');
}

function _storeState() {
  window.localStorage.setItem(
    'state',
    JSON.stringify({screen: state.screen, nickname: state.nickname})
  );
}

function _loadStoredState() {
  const storedState = JSON.parse(window.localStorage.getItem('state'));

  if (storedState instanceof Object && 'screen' in storedState && 'nickname' in storedState) {
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
  }
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
  const element = document.getElementById(elementId)

  if (!element) {
    console.error('Cannot select element', elementId);
    return;
  }

  element.textContent = text;
}


function _hideById(elementId) {
  const element = document.getElementById(elementId)
  if (element) {
    element.classList.add('hidden');
  }
}

function _showById(elementId) {
  const element = document.getElementById(elementId)
  if (element) {
    element.classList.remove('hidden');
  }
}

function _hideByClass(elementsClass) {
  document.querySelectorAll(elementsClass)
    .forEach(element => element.classList.add('hidden'));
}

function _showByClass(elementsClass) {
  document.querySelectorAll(elementsClass)
    .forEach(element => element.classList.remove('hidden'));
}