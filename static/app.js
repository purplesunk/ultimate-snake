const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

const keys = {};
let prev = {}

let SQUARE_SIZE, PERC_SIZE;
detectCanvasSizing();

canvas.style.backgroundColor = settings['background'];
let fontColor = getFontColor(settings['background']);

// Need Fix
function getFontColor(hex) {
    let r = parseInt(hex.substring(1,2), 16);
    let g = parseInt(hex.substring(3,4), 16);
    let b = parseInt(hex.substring(5,6), 16);

    if ((((r*299)+(g*587)+(b*114))/1000) >= 128) {
        return 'black';
    }
    else {
        return 'white';
    }
}

const hardmode = settings['hardmode'];
let score = 0;

const snake = {
    color: settings['snake_colors'],
    body: [
        { x: canvas.width / 2,  y: canvas.height / 2, width: SQUARE_SIZE, height: SQUARE_SIZE }, 
        { x: (canvas.width / 2) - SQUARE_SIZE, y: (canvas.height / 2), width: SQUARE_SIZE, height: SQUARE_SIZE }, 
        { x: (canvas.width / 2) - SQUARE_SIZE * 2, y: canvas.height / 2, width: SQUARE_SIZE, height: SQUARE_SIZE }
    ],
    direction: 'right',
    moving: !isSettings,
};

const food = {
    x: 0,
    y: 0,
    color: settings['food_color'],
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
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
const movements = {
    up: function() {
        snake.body[0].y -= SQUARE_SIZE;

        // if hit a wall get to the other side or gameover if hardmode
        if (snake.body[0].y < 0) {
            hardmode ? gameOver() : snake.body[0].y = canvas.height - SQUARE_SIZE;
        }
    },
    down:  function() { 
        snake.body[0].y += SQUARE_SIZE;

        if (snake.body[0].y + snake.body[0].height > canvas.height) {
            hardmode ? gameOver() : snake.body[0].y = 0;
        }
    },
    left:  function() {
        snake.body[0].x -= SQUARE_SIZE; 

        if (snake.body[0].x < 0) {
            hardmode ? gameOver() : snake.body[0].x = canvas.width - SQUARE_SIZE;
        }
    },
    right:  function() {
        snake.body[0].x += SQUARE_SIZE;

        if (snake.body[0].x + snake.body[0].width > canvas.width) {
            hardmode ? gameOver() : snake.body[0].x = 0;
        }
    }, 
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

function addNewHead() {
    let newHead = { ...snake['body'][0] }
    snake.body.unshift(newHead);
}

function moveDirection(direction) {
    if (!snake.moving) return;
    
    // MOVEMENT
    addNewHead();
    // Move new head to next position
    movements[direction]();

    // COLLISIONS
    let snakeHead = snake['body'][0];
    if (snakeCollision(snakeHead)) gameOver();

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

// function to get data for settings:
function getData(data) {
    return data;
}

// FINISHING THE GAME FUNCTIONS

function gameOver() {
    snake.moving = false;

    if (document.querySelector('form')) {
        return;
    }

    const form = document.createElement('form');
    form.className = 'center bg-dark p-3 d-flex flex-column gap-2 text-light';
    form.action = "/";
    form.method = "post";
    
    let elements = inputElements();
    for (let i = 0; i < elements.length; i++) {
        form.appendChild(elements[i]);
    }

    document.querySelector('body').appendChild(form);
}

function inputElements() {
    let elements = [];
    const div = inputGroup();   

    elements.push(createDOCElement('input', 'score', 'hidden', score, ''));
    elements.push(createDOCElement('p', '', '', '', 'lead text-center', 'SCORE: ' + score.toString()));
    elements.push(createDOCElement('input', 'speed', 'hidden', settings.speed, ''));
    elements.push(div);
    elements.push(createDOCElement('input', 'hardmode', 'hidden', hardmode, ''));
    elements.push(createDOCElement('button', '', 'submit', '', 'btn btn-primary form-control', 'Save your score'));

     return elements;
}

function inputGroup() {
    const div = document.createElement('div');
    const name = createDOCElement('input', 'name', 'text', '', 'form-control');
    const label = createDOCElement('label', '', '', '', 'input-group-text', 'Name: ');
    label.for = 'name';
    name.placeholder = 'Your Name';
    if (settings.name) name.value = settings.name;
    div.className = 'input-group mb-3';
    div.appendChild(label);
    div.appendChild(name);

    return div;
}

function createDOCElement(element, id, type, value, classes, text = "") {
    el = document.createElement(element);
    el.id = id;
    el.name = id;
    el.type = type;
    el.value = value;
    el.className = classes;
    el.innerText = text;

    return el;
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

// CANVAS SIZE DEPENDS ON DEVICE TO MANTAIN 40x40 MAP:
function detectCanvasSizing() {
    if (isSettings) {
        canvas.width = canvas.height = canvas.offsetWidth;

        SQUARE_SIZE = (canvas.height - (canvas.height % 20)) / 20;
    }
    else {
        let mapSize;
        window.innerHeight > window.innerWidth ? mapSize = window.innerWidth : mapSize = window.innerHeight;

        canvas.style.width = canvas.style.height = mapSize + "px";
        canvas.height = canvas.width = mapSize - (mapSize % 40);

        SQUARE_SIZE = (canvas.height - (canvas.height % 40)) / 40;

        detectUserInput();
    }

    PERC_SIZE = SQUARE_SIZE * 10 / 100;
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
    }
}
startAnimating(settings.speed);

// DRAWING ON CANVAS FUNCTIONS: 
function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSnake();
    drawFood();
    if (!isSettings) drawScore();
    changeDirection();
}
function drawSnake() {
    for (let i = 0; i < snake.body.length; i++) {
        let part = snake.body[i]
        ctx.fillStyle = snake.color[i % snake.color.length];
        ctx.fillRect(part.x, part.y, part.width, part.height);

        if (i == 0) {
            drawSnakeHead(part);   
        }
    }
}

function drawSnakeHead(part) {
    ctx.strokeRect(part.x, part.y, part.width, part.height);
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
}

function drawFood() {
    ctx.fillStyle = food.color;
    ctx.fillRect(food.x, food.y, food.width, food.height);
    ctx.strokeRect(food.x, food.y, food.width, food.height);

    // Decorations
    ctx.fillStyle = "green";
    ctx.fillRect(food.x + (food.width / 2), food.y - PERC_SIZE, PERC_SIZE, PERC_SIZE);
    ctx.fillRect(food.x + (food.width / 2) + PERC_SIZE, food.y - PERC_SIZE * 2, PERC_SIZE, PERC_SIZE);
    // Reset stroke color
    ctx.strokeStyle = "black";
}

function drawScore() {
    ctx.beginPath();
    ctx.font = '18pt VT323, monospace';
    ctx.fillStyle = fontColor;
    ctx.textAlign = 'left';
    ctx.fillText("score: " + score, 10, 30);
}

// Settings menu functions 
function addColors() {
    const add = document.querySelector('#add');
    const remove = document.querySelector('#remove');
    const div = document.querySelector('.snake-color');
    
    add.addEventListener('click', function() {
        if (div.childElementCount < 3) {
            let color = document.createElement('input');
            let string = 'snake-color' + div.childElementCount.toString();
            color.dataset.index = div.childElementCount;
            color.className = 'form-control-color form-control';
            color.id = string;
            color.name = string;
            color.type = 'color';
            color.value = snake.color[0];
            snake.color.push(snake.color[0]);
            div.appendChild(color);
            updateInputs();
        }
    });
    
    remove.addEventListener('click', function() {
        if (div.childElementCount > 1) {
            div.removeChild(div.lastElementChild);
            snake.color.pop();
            updateInputs();
        }
    });

    updateInputs();
}    
    
    
function updateInputs() {
    const inputs = form.querySelectorAll('input');
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].removeEventListener('change', changeColor);
    }
    addResponsiveButtons();
}

function addResponsiveButtons() {
    const inputs = form.querySelectorAll('input')
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener('change', e => changeColor(e));
    }
}

function changeColor(e) {
    if (e.target.id == 'food-color') {
        food.color = e.target.value;
    }
    else if (e.target.id == 'background') {
        canvas.style.backgroundColor = e.target.value;
    }
    else {
        snake.color[e.target.dataset.index] = e.target.value;
    }
}