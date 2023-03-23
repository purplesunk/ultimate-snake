// Settings menu functions 
const form = document.querySelector('#settings-form');
const div = document.querySelector('.snake-color');

function changeColor(e) {
    if (e.target.id == 'food-color') {
        food.color = e.target.value;
    }
    else if (e.target.id == 'background') {
        canvas.style.backgroundColor = e.target.value;
        bgColor = e.target.value
        fontColor = getFontColor(e.target.value);
        drawSquares(20);
    }
    else {
        snake.color[e.target.dataset.index] = e.target.value;
    }
}

document.querySelector('#add').addEventListener('click', function() {
    if (div.childElementCount < 3) {
        let color = document.createElement('input');
        let string = 'snake-color' + div.childElementCount.toString();
        color.dataset.index = div.childElementCount;
        color.className = 'form-control-color form-control';
        color.id = string;
        color.name = string;
        color.type = 'color';
        color.value = snake.color[0];
        color.addEventListener('change', (e) => changeColor(e));
        snake.color.push(snake.color[0]);
        div.appendChild(color);
    }
});
    
document.querySelector('#remove').addEventListener('click', function() {
    if (div.childElementCount > 1) {
        div.removeChild(div.lastElementChild);
        snake.color.pop();
    }
});

document.querySelector('#grid').addEventListener('change', function(e) {
    if (e.target.checked) {
        hasGrid = 'on';
        drawSquares(20);
    } 
    else {
        hasGrid = false;
    }
});

document.querySelector('#stroke').addEventListener('change', function(e) {
    if (e.target.checked) {
        hasStroke = 'on';
    }
    else {
        hasStroke = false;
    }
});

function eventShare(e) {
    const div = document.querySelector('div.flashes');
    div.classList.toggle('d-none');

    form.action = '/submit-settings';
}