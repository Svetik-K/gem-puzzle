let gameSize = 4;
let gameMatrix;
let blankBox;
let movesCounter = 0;
let minutes = '00';
let seconds = '00';
let gameCounter;
let res;

if(localStorage.currGame) {
    let answer = confirm('Continue saved game?');
    if(answer === true) {
        createPageLayout();
        loadSavedGame();
    }else {
        createPageLayout();
        createGame();
    }

} else {
    createPageLayout();
    createGame();
}

const game = document.querySelector('.game');
const saveBtn = document.querySelector('.button_save');
const resultesBtn = document.querySelector('.button_results');

const audio = document.getElementById('audio');
audio.volume = 0;
const soundSwitcher = document.querySelector('input');

saveBtn.addEventListener('click', () => {
    if(saveBtn.textContent === 'Save') {
        saveCurrentGame();
    }
    else if(saveBtn.textContent === 'Load') {
        loadSavedGame();
        enableStopBtn();
        saveBtn.textContent = 'Save';
    }
})

function saveCurrentGame() {
    const game = document.querySelector('.game');
    let savedGame = game.innerHTML;
    const extra = {
        'moves': movesCounter,
        'minutes': minutes,
        'seconds': seconds,
        'matrix': gameMatrix 
    }
    localStorage.currGame = JSON.stringify(savedGame);
    localStorage.extra = JSON.stringify(extra);
    alert('Your current game has been saved');
    saveBtn.textContent = 'Load';
}

function loadSavedGame() {
    const savedGame = JSON.parse(localStorage.currGame);
    const extra = JSON.parse(localStorage.extra);
    movesCounter = extra.moves;
    minutes = extra.minutes;
    seconds = extra.seconds;
    gameMatrix = extra.matrix;
    const game = document.querySelector('.game');
    game.innerHTML = '';
    game.innerHTML = savedGame;
    blankBox = gameMatrix.length ** 2;
    const moves = document.querySelector('.extra__moves');
    moves.textContent = `Moves: ${movesCounter}`;
    disableShuffleBtn();
    setGameCounter();
    game.classList.remove('shuffling');

    delete localStorage.currGame;
    delete localStorage.extra;
}

function createPageLayout() {

    const gameContainer = document.createElement('div');
    gameContainer.classList.add('container');
    gameContainer.innerHTML = `
        <div class="sound">
            Sound off<input type="checkbox"> on
        </div>
        <audio id="audio" src="./audio/sound_click.mp3"></audio>
        <div class="buttons">
            <button class="button button_shuffle">Shuffle and Start</button>
            <button class="button button_stop">Stop</button>
            <button class="button button_save">Save</button>
            <button class="button button_results">Results</button>
        </div>
        <div class="extra">
            <div class="extra__moves">Moves: ${movesCounter}</div>
            <div class="extra__time">Time: ${minutes}:${seconds}</div>
        </div>
        <div class="game"></div>
        <div class="sizes">
            <div class="sizes__title">Frame size: 4 X 4</div>
            <div class="sizes__variants"></div>
        </div>
    `;
    document.body.append(gameContainer);

    const sizeVariants = document.querySelector('.sizes__variants');
    for(let i = 0; i < 6; i++) {
        let variant = document.createElement('a');
        variant.href = '#';
        variant.id = `size-${i+3}`;
        variant.textContent = `${i+3} X ${i+3}`;
        sizeVariants.append(variant);
    }
}

function createGame(gameSize = 4) {
    let numbers = new Array(gameSize ** 2).fill(0).map((item, index) => index + 1);
    const game = document.querySelector('.game');

    numbers.forEach(num => {
        const numBox = document.createElement('div');
        numBox.classList.add('game__box', `game-size-${gameSize}`);
        numBox.dataset.matrixId = num; 

        const numTile = document.createElement('div');
        numTile.classList.add('game__tile'); 
        numTile.innerText = num;
            
        numBox.append(numTile);
        game.append(numBox);
    })

    const boxes = Array.from(document.querySelectorAll('.game__box'));
    let boxesIds = boxes.map(item => Number(item.dataset.matrixId));
    gameMatrix = createMatrix(boxesIds, gameSize);
    createTilesLayout(gameMatrix);
    boxes[boxes.length - 1].style.visibility = 'hidden';
    blankBox = boxes.length;
    const moves = document.querySelector('.extra__moves');
    movesCounter = 0;
    moves.textContent = `Moves: ${movesCounter}`;
    enableShuffleBtn();
    disableStopBtn();
    setCounterToNull();
    game.classList.add('shuffling');
}

resultesBtn.addEventListener('click', () => {
    createResultsTable();
    document.querySelector('.results').style.display = 'flex';
});

document.addEventListener('click', (e) => {
    if(e.target.classList.contains('results')) {
        document.querySelector('.results'). style.display = 'none';
    }
})

game.addEventListener('click', (e) => {
    if(soundSwitcher.checked === true) {
        audio.volume = 0.4;
        audio.play();
    }
    const currBox = e.target.closest('.game__box');
    if(!currBox) {
        return;
    }

    const boxNum = Number(currBox.dataset.matrixId);
    const boxCoords = findCoords(boxNum, gameMatrix);
    const blankBoxCoords = findCoords(blankBox, gameMatrix);
    const isSwappable = isValidForSwap(blankBoxCoords, boxCoords);
    
    if(isSwappable) {
        swapTiles(blankBoxCoords, boxCoords, gameMatrix);
        createTilesLayout(gameMatrix);

        let gameSize = gameMatrix[0].length;
        const moves = document.querySelector('.extra__moves');
        movesCounter++;
        moves.textContent = `Moves: ${movesCounter}`;

        if(isWon(gameMatrix, gameSize)) {
            addCongrats();
            clearInterval(gameCounter);
            disableSaveBtn();
            disableStopBtn(); 

            if(!localStorage.results) {
                res = [movesCounter];
                localStorage.results = JSON.stringify(res);
                createResultsTable();
            } else {
                res = JSON.parse(localStorage.results);
                res.push(movesCounter);
                localStorage.results = JSON.stringify(res);
                createResultsTable();
            }   
        }
    }
})

const maxShuffleNum = 70;
let timer;
const shuffleBtn = document.querySelector('.button_shuffle');
shuffleBtn.addEventListener('click', () => {
    let shuffleCounter = 0;
    clearInterval(timer);

    timer = setInterval(() => {
        randomMove(gameMatrix);
        createTilesLayout(gameMatrix);
        shuffleCounter++;

        if(shuffleCounter >= maxShuffleNum) {
            clearInterval(timer);
        }

    }, 35);

    game.classList.remove('shuffling');
    movesCounter = 0;
    disableShuffleBtn();

    setTimeout(() => {
        setGameCounter();
        enableStopBtn();
    }, 2500);
})

function setGameCounter() {
    clearInterval(gameCounter);
    gameCounter = setInterval(() => { 
        if(seconds == 59) {
            seconds = '00';
            minutes = parseInt(minutes) + 1;
        }

        seconds = parseInt(seconds) + 1;
        if(seconds < 10) {
            seconds = '0' + seconds;
        }
        if(minutes.toString().length === 1) {
            minutes = '0' + minutes;
        }
        if( minutes == 59 && seconds == 59) {
            setCounterToNull();
            addLose();
        }
        const time = document.querySelector('.extra__time');
        time.textContent = `Time: ${minutes}:${seconds}`;     

    }, 1000);
}

const stopBtn = document.querySelector('.button_stop');
stopBtn.addEventListener('click', (e) => {
    if(stopBtn.textContent === 'Stop') {
        freezeCounter();
    } else {
        setGameCounter();
        stopBtn.textContent = 'Stop'
        game.classList.remove('shuffling');
    } 
    e.preventDefault();
})

function freezeCounter() {
    clearInterval(gameCounter);
    game.classList.add('shuffling');
    stopBtn.textContent = 'Start';
}

let blockedTile = null;
function randomMove(matrix) {
    const blankBoxCoords = findCoords(blankBox, matrix);
    const availableMoves = findAvailableCoords({blankBoxCoords, matrix, blockedTile});
    const randomCoords = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    swapTiles(blankBoxCoords, randomCoords, matrix);
    blockedTile = blankBoxCoords;
}

function findAvailableCoords({blankBoxCoords, matrix, blockedTile}) {
    const availableCoords = [];

    for(let y = 0; y < matrix.length; y++) {
        for(let x = 0; x < matrix[y].length; x++) {
            if(isValidForSwap({x,y}, blankBoxCoords)) {
                if(!blockedTile || !(blockedTile.x === x && blockedTile.y === y)) {
                    availableCoords.push({x,y})
                }
            }
        }
    }
    return availableCoords;
}

const sizeVariants = document.querySelector('.sizes__variants');
sizeVariants.addEventListener('click', (e) => {
    if(!e.target.id) {
        return;
    }
    const size = e.target.id.slice(-1);
    game.innerHTML = '';
    createGame(size);
    const sizeText = e.target.textContent;
    const title = document.querySelector('.sizes__title');
    title.textContent = `Frame size: ${sizeText}`;
    stopBtn.textContent = 'Stop';
    saveBtn.classList.remove('button_disabled');   
})

function createMatrix(arr, size) {
    let matrix = [];
    for(let j = 0; j < size; j++) {
        matrix.push([]);
    }
    let y = 0;
    let x = 0;

    for(let i = 0; i < arr.length; i++) {
        if(x >= size) {
            y++;
            x = 0;
        }
        matrix[y][x] = arr[i];
        x++;
    }
    return matrix;
}

function createTilesLayout(gameMatrix) {

    for(let y = 0; y < gameMatrix.length; y++) {
        for(let x = 0; x < gameMatrix[y].length; x++) {
            const matrixItem = gameMatrix[y][x];
            const boxes = Array.from(document.querySelectorAll('.game__box'));
            let box;
            for(let item of boxes) {
                if(item.dataset.matrixId == matrixItem) {
                    box = item;
                }
            }
            setTilesTransform(box, x, y);
        }
    }
}

function setTilesTransform(tile, x, y) {
    const shiftPercent = 100;
    tile.style.transform = `translate3D(${x * shiftPercent}%, ${y * shiftPercent}%, 0)`;
}

function shuffleTiles(arr) {
    return arr
        .map(value => ({value, sort: Math.random()}))
        .sort((a, b) => a.sort - b.sort)
        .map(({value}) => value);
}

function findCoords(number, gameMatrix) {
    for(let y = 0; y < gameMatrix.length; y++) {
        for(let x = 0; x < gameMatrix[y].length; x++) {
            if(gameMatrix[y][x] == number) {
                return { x, y };
            }
        }
    }
    return null;
}

function isValidForSwap(obj1, obj2) {
    const diffX = Math.abs(obj1.x - obj2.x);
    const diffY = Math.abs(obj1.y - obj2.y);

    return (diffX === 1 || diffY === 1) && (obj1.x === obj2.x || obj1.y === obj2.y);
}

function swapTiles(obj1, obj2, matrix) {
    const coords = matrix[obj1.y][obj1.x];
    matrix[obj1.y][obj1.x] = matrix[obj2.y][obj2.x];
    matrix[obj2.y][obj2.x] = coords;
}

function isWon(matrix, gameSize) {
    let winCombination = new Array(gameSize ** 2).fill(0).map((item, index) => index + 1);
    const flatMatrix = matrix.flat();
    for(let i = 0; i < flatMatrix.length; i++) {
        if(flatMatrix[i] !== winCombination[i]) {
            return false;
        }
    }
    return true;
}

function addCongrats() {
    const congrats = document.createElement('div');
    congrats.classList.add('game__congrats');
    congrats.textContent = `Hooray! You solved the puzzle in ${minutes}:${seconds} and ${movesCounter} moves!!`;
    game.append(congrats);

    setTimeout(() => {
        congrats.style.display = 'flex';
        game.classList.add('shuffling');
    }, 500);
    
}

function addLose() {
    const lose = document.createElement('div');
    lose.classList.add('game__lose');
    lose.textContent = 'YOU LOSE!!!';
    game.append(lose);

    setTimeout(() => {
        lose.style.display = 'flex';
        game.classList.add('shuffling');
    }, 500);
    
}

function setCounterToNull() {
    clearInterval(gameCounter);
    minutes = '00';
    seconds = '00';
    const time = document.querySelector('.extra__time');
    time.textContent = `Time: ${minutes}:${seconds}`;  
}

function createResultsTable() {
    const resultLayer = document.createElement('div');
    resultLayer.classList.add('results');

    const resultsTable = document.createElement('div');
    resultsTable.classList.add('results__table');

    const title = document.createElement('p');
    title.classList.add('results__title');
    title.textContent = 'Top Score';
    resultsTable.append(title);

    const resultsList = document.createElement('ol');
    resultsList.classList.add('results__list');
  
    if(localStorage.results) {
        const resultsArr = JSON.parse(localStorage.results);
        resultsArr.sort((a, b) => a - b).forEach(item => {
        const listItem = document.createElement('li');
        listItem.classList.add('list__item');
        listItem.textContent = `${item}  moves`;
        resultsList.appendChild(listItem);
        })
    }
    
    resultsTable.append(resultsList);
    resultLayer.append(resultsTable);
    document.body.append(resultLayer);
}

function disableShuffleBtn() {
    const shuffleBtn = document.querySelector('.button_shuffle');
    shuffleBtn.disabled = true;
    shuffleBtn.classList.add('button_disabled');
}

function enableShuffleBtn() {
    const shuffleBtn = document.querySelector('.button_shuffle');
    shuffleBtn.disabled = false;
    shuffleBtn.classList.remove('button_disabled');
}

function disableStopBtn() {
    const stopBtn = document.querySelector('.button_stop');
    stopBtn.disabled = true;
    stopBtn.classList.add('button_disabled');
}

function enableStopBtn() {
    const stopBtn = document.querySelector('.button_stop');
    stopBtn.disabled = false;
    stopBtn.classList.remove('button_disabled');
}

function disableSaveBtn() {
    const saveBtn = document.querySelector('.button_save');
    saveBtn.disabled = true;
    saveBtn.classList.add('button_disabled');
}