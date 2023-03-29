const canvas = document.querySelector('#canvas');
const grid = document.createElement('canvas');
const ctx = canvas.getContext('2d');

const keys = {};
let prev = {}

let bgColor = settings['background'];

grid.style.backgroundColor = canvas.style.backgroundColor = bgColor;
let fontColor = getFontColor(bgColor);

let hasGrid = settings.grid;
let hasStroke = settings.stroke;

let SQUARE_SIZE, PERC_SIZE, blocks;
// CANVAS SIZE DEPENDS ON DEVICE TO MANTAIN 40x40 MAP:
function detectCanvasSizing() {
    if (isSettings) {
        let mapSize = canvas.offsetWidth;
        grid.width = grid.height = canvas.width = mapSize - (mapSize % 20);
        canvas.height = canvas.width / 2;

        SQUARE_SIZE = (mapSize - (mapSize % 20)) / 20;
        
        drawSquares(20);
    }
    else {
        let mapSize;
        window.innerHeight > window.innerWidth ? mapSize = window.innerWidth : mapSize = window.innerHeight;

        canvas.style.width = canvas.style.height = mapSize + "px";
        grid.width = grid.height = canvas.height = canvas.width = mapSize - (mapSize % settings['grid_size']);

        SQUARE_SIZE = (canvas.height - (canvas.height % settings['grid_size'])) / settings['grid_size'];

        drawSquares(settings['grid_size']);
        detectUserInput();
    }

    PERC_SIZE = SQUARE_SIZE * 10 / 100;
}
detectCanvasSizing();

const hardmode = settings['hardmode'];
let score = 0;

const snake = {
    color: settings['snake_colors'],
    body: [
        { x: canvas.width / 2,  y: canvas.height / 2 }, 
        { x: (canvas.width / 2) - SQUARE_SIZE, y: (canvas.height / 2), }, 
        { x: (canvas.width / 2) - SQUARE_SIZE * 2, y: canvas.height / 2, },
        { x: (canvas.width / 2) - SQUARE_SIZE * 3, y: canvas.height / 2, }
    ],
    direction: 'right',
    moving: !isSettings,
};

const food = {
    x: 0,
    y: 0,
    color: settings['food_color'],
}
spawnNewFood();

// FOOD UTILS
function getNewCoordinate(value) {
    let number = Math.floor(Math.random() * value);
    if (number > value - SQUARE_SIZE) number -= SQUARE_SIZE;
    return number - (number % SQUARE_SIZE);
}

function spawnNewFood() {
    food.x = getNewCoordinate(canvas.width);
    food.y = getNewCoordinate(canvas.height);
    if (snakeCollision(food)) {
        spawnNewFood();
    }
    else {
        return;
    }
}

// MOVEMENT FUNCTIONS 
function movements(direction) {
    if (direction == 'up') {
        snake.body[0].y -= SQUARE_SIZE;

        // if hit a wall get to the other side or gameover if hardmode
        if (snake.body[0].y < 0) {
            hardmode ? gameOver() : snake.body[0].y = canvas.height - SQUARE_SIZE;
        }
    }
    if (direction == 'down') { 
        snake.body[0].y += SQUARE_SIZE;

        if (snake.body[0].y + SQUARE_SIZE > canvas.height) {
            hardmode ? gameOver() : snake.body[0].y = 0;
        }
    }
    if (direction == 'left') {
        snake.body[0].x -= SQUARE_SIZE; 

        if (snake.body[0].x < 0) {
            hardmode ? gameOver() : snake.body[0].x = canvas.width - SQUARE_SIZE;
        }
    }
    if (direction == 'right') {
        snake.body[0].x += SQUARE_SIZE;

        if (snake.body[0].x + SQUARE_SIZE > canvas.width) {
            hardmode ? gameOver() : snake.body[0].x = 0;
        }
    } 
}

function changeDirection() {
    if ((keys['w'] || keys['W'] || keys['ArrowUp']) && snake.direction != 'down') {
        snake.direction = 'up';
        moveDirection(snake.direction);
    }
    else if ((keys['s'] || keys['S'] || keys['ArrowDown']) && snake.direction != 'up') {
        snake.direction = 'down';
        moveDirection(snake.direction);
    }
    else if ((keys['a'] || keys['A'] || keys['ArrowLeft']) && snake.direction != 'right') {
        snake.direction = 'left';
        moveDirection(snake.direction);
    }
    else if ((keys['d'] || keys['D'] || keys['ArrowRight']) && snake.direction != 'left') {
        snake.direction = 'right';
        moveDirection(snake.direction);
    }
    else {
        moveDirection(snake.direction);
    }
}

function gameOver() {
    snake.moving = false;
    document.querySelector('div.flashes').classList.remove('d-none');
    document.querySelector('#score').value = score;
    document.querySelector('p.lead.text-center').innerHTML += score.toString();
    if (settings.name) document.querySelector('#name').value = settings.name;
}

function moveDirection(direction) {
    if (!snake.moving) return;
    
    // MOVEMENT
    let newHead = { ...snake['body'][0] }
    snake.body.unshift(newHead);
    // Move new head to next position
    movements(direction);

    // COLLISIONS
    let snakeHead = snake['body'][0];
    if (snakeCollision(snakeHead)) {
        gameOver();
    }

    if (!checkCollision(snakeHead, food)) {
        snake.body.pop();
    } 
    else {
        spawnNewFood();
        score++;
    }
};

// DETECT COLLISIONS FUNCTIONS 
function snakeCollision(thing) {
    for (let i = 0; i < snake.body.length; i++) {
        let part = snake.body[i];
        if (checkCollision(part, thing)) return true;
    }
}

function checkCollision(objOne, objTwo) {
    if (objOne != objTwo && objOne.x == objTwo.x && objOne.y == objTwo.y) {
        return true;
    }
}

// Movement detection:

function detectUserInput() {
    window.addEventListener('keydown', function(e) {
    keys[e.key] = true;
    });

    window.addEventListener('keyup', function(e) {
        delete keys[e.key];
    });

    canvas.onpointerdown = beginSliding;
    canvas.onpointerup = stopSliding;
}

// Add touchscreen funcionality:

function beginSliding(e) {
    prev = { x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
}

function stopSliding(e) {
    calculateDirection(e);
    canvas.releasePointerCapture(e.pointerId);
}

function calculateDirection(e) {
    x = prev.x - e.clientX;
    y = prev.y - e.clientY;

    if (Math.abs(x) > Math.abs(y)) {
        if (x > 0) {
            if (snake.direction != 'right') snake.direction = 'left';
        }
        else {
            if (snake.direction != 'left') snake.direction = 'right';
        }
    }
    else if (Math.abs(y) > Math.abs(x)) {
        if (y > 0) {
            if (snake.direction != 'down') snake.direction = 'up';
        }
        else {
            if (snake.direction != 'up') snake.direction = 'down';
        }
    }
} 


// Options
function drawSquares(blocks) {
    if (hasGrid != 'on') return; 

    let context = grid.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = getFontColor(bgColor);
    let alphas = [0.1, 0.2];
    for (let i = 0; i < blocks; i++) {
        for (let j = 0; j < blocks; j++) {
            context.globalAlpha = alphas[Math.abs(i - j) % alphas.length];
            context.fillRect(SQUARE_SIZE * i,SQUARE_SIZE * j, SQUARE_SIZE, SQUARE_SIZE);
        }
    }
}

function getFontColor(hex) {
    let r = parseInt(hex.substring(1,3), 16);
    let g = parseInt(hex.substring(3,5), 16);
    let b = parseInt(hex.substring(5,7), 16);

    if ((((r * 299) + (g * 587) + (b * 114) ) / 1000) >= 128) {
        return 'black';
    }
    else {
        return 'white';
    }
}

// CANVAS ANIMATION
// How to put fps in the canvas: 
// https://www.youtube.com/watch?v=EYf_JwzwTlQ
let fps, fpsInterval, startTime, now, then, elapsed;

function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    now = Date.now();
    elapsed = now - then;
    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);

        drawCanvas();
        changeDirection();
    }
}

// DRAWING ON CANVAS FUNCTIONS: 
function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (hasGrid == 'on') ctx.drawImage(grid, 0, 0);
    drawSnake();
    drawFood();
    if (!isSettings) drawScore();
}

function drawSnake() {
    for (let i = 0; i < snake.body.length; i++) {
        let part = snake.body[i]
        ctx.fillStyle = snake.color[i % snake.color.length];
        ctx.fillRect(part.x, part.y, SQUARE_SIZE, SQUARE_SIZE);
        if (i == 0) drawSnakeHead(part);   
        if (hasStroke == 'on') {
            ctx.strokeRect(part.x, part.y, SQUARE_SIZE, SQUARE_SIZE);
        }
    }
}

function drawSnakeHead(part) {
    // Draw eyes
    ctx.fillStyle = "black";
    ctx.fillRect(part.x + PERC_SIZE * 2, part.y + PERC_SIZE * 6, PERC_SIZE * 2, PERC_SIZE * 2);
    ctx.fillRect(part.x + PERC_SIZE * 6, part.y + PERC_SIZE * 6, PERC_SIZE * 2, PERC_SIZE * 2); 

    // Draw tongue
    ctx.fillStyle = "red";
    switch(snake.direction) {
        case 'up': {
            ctx.fillRect(part.x + PERC_SIZE * 4, part.y, PERC_SIZE, PERC_SIZE * -2);
            ctx.fillRect(part.x + PERC_SIZE * 5, part.y - PERC_SIZE * 2, PERC_SIZE, PERC_SIZE * -2);
            ctx.fillRect(part.x + PERC_SIZE * 4, part.y - PERC_SIZE * 4, PERC_SIZE, PERC_SIZE * -1);
            break;
        }
        case 'down': {
            ctx.fillRect(part.x + PERC_SIZE * 4, part.y + PERC_SIZE * 10, PERC_SIZE, PERC_SIZE * 2);
            ctx.fillRect(part.x + PERC_SIZE * 5, part.y + PERC_SIZE * 12, PERC_SIZE, PERC_SIZE * 2);
            ctx.fillRect(part.x + PERC_SIZE * 4, part.y + PERC_SIZE * 14, PERC_SIZE, PERC_SIZE * 1);
            break;
        }
        case 'right': {
            ctx.fillRect(part.x + PERC_SIZE * 10, part.y + PERC_SIZE * 4, PERC_SIZE * 2, PERC_SIZE);
            ctx.fillRect(part.x + PERC_SIZE * 12, part.y + PERC_SIZE * 5, PERC_SIZE * 2, PERC_SIZE);
            ctx.fillRect(part.x + PERC_SIZE * 14, part.y + PERC_SIZE * 4, PERC_SIZE * 1, PERC_SIZE);
            break;
        }
        case 'left': {
            ctx.fillRect(part.x, part.y + PERC_SIZE * 4, PERC_SIZE * -2, PERC_SIZE);
            ctx.fillRect(part.x - PERC_SIZE * 2, part.y + PERC_SIZE * 5, PERC_SIZE * -2, PERC_SIZE);
            ctx.fillRect(part.x - PERC_SIZE * 4, part.y + PERC_SIZE * 4, PERC_SIZE * -1, PERC_SIZE);
            break;
        }
    }
    if (hasStroke != 'on') {
        ctx.strokeRect(part.x, part.y, SQUARE_SIZE, SQUARE_SIZE);
    }
}

function drawFood() {
    ctx.fillStyle = food.color;
    ctx.fillRect(food.x, food.y, SQUARE_SIZE, SQUARE_SIZE);
    ctx.strokeRect(food.x, food.y, SQUARE_SIZE, SQUARE_SIZE);

    // Decorations
    ctx.fillStyle = "green";
    ctx.fillRect(food.x + (SQUARE_SIZE/ 2), food.y - PERC_SIZE, PERC_SIZE, PERC_SIZE);
    ctx.fillRect(food.x + (SQUARE_SIZE/ 2) + PERC_SIZE, food.y - PERC_SIZE * 2, PERC_SIZE, PERC_SIZE);
}

function drawScore() {
    ctx.beginPath();
    ctx.font = '18pt Silkscreen, monospace';
    ctx.fillStyle = fontColor;
    ctx.textAlign = 'left';
    ctx.fillText("score: " + score, 10, 30);
}
