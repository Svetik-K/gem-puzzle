let gameSize = 4;
let gameMatrix;
let blankBox;
let movesCounter = 0;
let minutes = '00';
let seconds = '00';
let gameCounter;

createPageLayout();
createGame();

const game = document.querySelector('.game');
const saveBtn = document.querySelector('.button_save');
game.addEventListener('click', (e) => {
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
            saveBtn.disabled = true;
            saveBtn.classList.add('button_disabled');
            stopBtn.disabled = true;
            stopBtn.classList.add('button_disabled');
        }
    }
})

const maxShuffleNum = 1;
let timer;
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

    }, 30);

    game.classList.remove('shuffling');
    movesCounter = 0;
    shuffleBtn = document.querySelector('.button_shuffle');
    shuffleBtn.disabled = true;
    shuffleBtn.classList.add('button_disabled');

    setTimeout(() => {
        setGameCounter();
        const stopBtn = document.querySelector('.button_stop');
        stopBtn.disabled = false;
        stopBtn.classList.remove('button_disabled');
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
            //добавляем Гейм овер
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

function createPageLayout() {

    const gameContainer = document.createElement('div');
    gameContainer.classList.add('container');
    gameContainer.innerHTML = `
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
    boxes[boxes.length - 1].style.display = 'none';
    blankBox = boxes.length;
    const moves = document.querySelector('.extra__moves');
    movesCounter = 0;
    moves.textContent = `Moves: ${movesCounter}`;
    shuffleBtn = document.querySelector('.button_shuffle');
    shuffleBtn.disabled = false;
    shuffleBtn.classList.remove('button_disabled');
    const stopBtn = document.querySelector('.button_stop');
    stopBtn.disabled = true;
    stopBtn.classList.add('button_disabled');
    game.classList.add('shuffling');
    setCounterToNull();
}

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

function createTilesLayout(matrix) {
    for(let y = 0; y < matrix.length; y++) {
        for(let x = 0; x < matrix[y].length; x++) {
            const matrixItem = matrix[y][x];
            const boxes = Array.from(document.querySelectorAll('.game__box'));
            let box = boxes[matrixItem - 1];
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

function findCoords(number, matrix) {
    for(let y = 0; y < matrix.length; y++) {
        for(let x = 0; x < matrix[y].length; x++) {
            if(matrix[y][x] === number) {
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
    congrats.textContent = 'Congratulations! You Won!';
    game.append(congrats);

    setTimeout(() => {
        congrats.style.display = 'flex';
        game.classList.toggle('shuffling');
    }, 500);
    
}

function setCounterToNull() {
    clearInterval(gameCounter);
    minutes = '00';
    seconds = '00';
    const time = document.querySelector('.extra__time');
    time.textContent = `Time: ${minutes}:${seconds}`;  
}