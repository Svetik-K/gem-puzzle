let gameSize = 4;
let gameMatrix;
let blankBox;

createPageLayout();
createGame();

const game = document.querySelector('.game');

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

        if(isWon(gameMatrix, gameSize)) {
            console.log(gameMatrix)
            addCongrats();
        }
    }
})

const shuffleBtn = document.querySelector('.button_shuffle');
const maxShuffleNum = 50;
let timer;
shuffleBtn.addEventListener('click', () => {
    let shuffleCounter = 0;
    clearInterval(timer);
    game.classList.add('shuffling');

    timer = setInterval(() => {
        randomMove(gameMatrix);
        createTilesLayout(gameMatrix);
        shuffleCounter++;

        if(shuffleCounter >= maxShuffleNum) {
            clearInterval(timer);
        }

    }, 60);

    game.classList.remove('shuffling');
})

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
            <div class="extra__moves">Moves:</div>
            <div class="extra__time">Time:</div>
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
    document.querySelector('.button_shuffle').disabled = false;

    let boxesIds = boxes.map(item => Number(item.dataset.matrixId));
    gameMatrix = createMatrix(boxesIds, gameSize);
    console.log(gameMatrix)
    createTilesLayout(gameMatrix);
    boxes[boxes.length - 1].style.display = 'none';
    blankBox = boxes.length;
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
        document.querySelector('.button_shuffle').disabled = true;
    }, 500);
    
}