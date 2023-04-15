# Ultimate Snake
## Description:
Snake game made with JavaScript, HTML, CSS, Bootstrap and Flask. The game can be played with **w, a, s, d keys, the arrow keys or swiping** in the canvas. You can choose colors for the snake, the background, etc. in the settings menu, see previous scores in the scores menu and share or copy color schemes from other players. 

### Live Game : https://ultimatesnake.pythonanywhere.com/

### This was for CS50:
## app.py and utils.py:
Here we have the logic for the diferent menus that the game has and hadles the saving of the settings and scores and the access to the database with the color schemes submited.

In utils.py we have two global variables `speeds` to do checks for the speed value when changing the settings and `default_settings` for having default settings in the game. It has defined some functions to make checks of names, hex colors and saving the setttings.

In the `'/'` is the main menu, here we define the user session and make it permanent to save the settings if changed and scores.

```
@app.route("/", methods = ['GET'])
def index():
    if 'user' not in session:
        session['user'] = { 'settings': default_settings.copy(), 'scores': [], 'game_played': False }
        session.modified = True
        session.permanent = True

    session['game_played'] = False
    return render_template('index.html')

```

In the `'/settings'` we check if the user has any settings or we show then the defaults.
```
@app.route('/settings', methods=['GET'])
def settings():
    check_user_settings(session)
    session['game_played'] = False
    return render_template('settings.html', settings=session['user']['settings'], speeds=speeds)
```
In the `'/game'` if the request is `POST` we check and save the settings then redirect to the '/game' and in the `GET` request we check if the user has settings then render the 'game.html'.

In the `'/scoreboard'` in the GET request we check if the user has a session then we render the 'scoreboard.html'. If the request is POST we check if the score and name are valid then we saved them and redirect to the '/scoreboard'.

In `'/delete-scores'` we send a editmode variable to the 'scoreboard.html' so it shows form buttons to delete scores, with the POST method we check which score to delete and delete it then redirect back to '/delete-scores'.

In `'/search-schemes` we get a `q` parameter for searching in the database of colorschemes then we only render 'search-schemes.html'.

```
@app.route('/search-schemes')
def search_schemes():
    search_term = "%" + request.args.get("q", "")  + "%"
    if search_term != "%" + "%":
        rows = db.execute('SELECT * FROM settings WHERE user LIKE ? OR title LIKE ? LIMIT 50',  search_term, search_term)
    else:
        rows = db.execute('SELECT * FROM settings ORDER BY RANDOM() LIMIT 50')
    
    return render_template('search-schemes.html', rows=rows)
```

In `/submit-settings` we check and save the settings, then check them if they are valid for submit and save them into the database and redirect back to the settings menu.

In `'/copy-scheme'` we get a parameter scheme-id then we search for the id in the database and copy the settings of the scheme to the settings of the user and redirect back to shared-schemes.

And in `/shared-schemes` just render the 'shared-schemes.html'.

## templates:
## layout.html:
The main template for all the app. Here we declare the title of the tab, the favicon, link the styles, add bootstrap and set the viewport for making the page phone compatible.

Inside the body we got a jinja if to get the flashed messages with a script to delete the messages after 3 seconds. After that we got the main block were all the other templates expand.

## index.html:
In here we got the main menu with 4 buttons wrapped in forms, the first one for play that calls `'/game'` with get method, the second to enter the settings menu that calls `'/settings'` with the get method, the third one to see the scores that calls `'/scoreboard'` with get method and the fourth one call `'/shared-schemes'`.

## settings.html and settings.js:
It extends `'layout.html'`, in the main block we include the `'canvas.html'` that shows the game and the `'script.html'` that has the script to make the game animate, after that we got the form with the main settings, every input has jinja sintax to grab the user settings so they know what are their settings. 

In the form we got 3 buttons one to save and play that calls '/game' with a POST request, other to save that calls '/save-settings' with POST and the share color scheme button that uses a function to show more inputs:

```
function eventShare(e) {
    const div = document.querySelector('div.flashes');
    div.classList.toggle('d-none');

    form.action = '/submit-settings';
}
```
In that form you can input your name and a title for the color scheme and it's submited to '/submit-settings'.

Then the last button is for going back to the main menu without saving '/'.

In the `settings.js` we got the functions to make the inputs change the settings in the canvas so you can see how you are changing the game. 

## scoreboard.html:
Here we have a table with the name, settings used and scores of the user, ordered by biggest score. We use a jinja for to read the user scores and place them in the table. At the end it has 2 button one to go back to the main menu, and the other to play again.
```
{% for score in scores %}
    <tr>
        <td>
            {{ scores.index(score) + 1 }}
        </td>
        <td>
            {{ score['name'] }}
        </td>
        <td class="d-flex justify-content-center">
            {% if score['hardmode'] == 'on' %}
                <span>&#10003;</span>
            {% else %}
                 <span>&#10007;</span>
            {% endif %}
        </td>
        <td>
            {{ score['speed'] }}
        </td>
        <td>
            {{ score['grid_size'] }}
        </td>
        <td>
            {{ score['score'] }}
        </td>
        <td>
           {% if editmode %} 
            <form action="/delete-scores" method="post">
                <input 
                type="hidden" 
                id="score-delete" 
                name="score-delete" 
                value='{{ scores.index(score) }}'>
                <button type="submit"  class="btn-close btn-close-white me-2 m-auto"></button>
            </form>
            {% endif %}
        </td>
    </tr>
{% endfor %}
```

### canvas.html:
It only has the canvas html so it can be include.
```
<canvas id="canvas" class="shadow border border-warning-subtle border-3"></canvas>
```

### script.html:
Has the script with the source equal to `'app.js'` that is where the logic for the game is.
```
<script src="static/app.js"></script>
```

### style.css:
Here we got a little CSS for the background color of the body, the canvas, and the center class. All the other styles are done with Bootstrap.


## game.html:
It includes the `'canvas.html'` and the `'script.html'` so that the game can be shown on the screen, it has a script to center the canvas in the screen with a class, and has a button to go back to the main menu. And has a div with a form so when you die it is shown to you so you can go back to the main menu, save your score or play again. The settings are pass with jinja so we can use them in game.js.
```
const settings = {{ settings | tojson }};
```

## game.js:
Here we got the logic of the game. It starts declaring the canvas and the context of the canvas, then we got the settings in an object that was gotten in the `'game.html'`, we got a function `detectCanvasSizing()` to size the canvas acording to the screen size and set the size of the squares in the "grid".

We have a `snake` object that gets the color from the `settings`, has a body that is a list with every position that is ocupied by the `snake`, the direction is moving.

We have a `food` object with it's position and it's color.

A function to change the position of the food when it's called. And other to get random coordinates of the grid.
```
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
```

A function `movements` where we got 4 if statements for every direction, and calculates the new position of the snake head depending on the direction of the snake.

Example of the if:
```
if (direction == 'up') {
    snake.body[0].y -= SQUARE_SIZE;

    // if hit a wall get to the other side or gameover if hardmode
    if (snake.body[0].y < 0) {
        hardMode ? gameOver() : snake.body[0].y = canvas.height - SQUARE_SIZE;
    }
}
```

It has a `keys` object where we save the keys that are pressed down, we got 2 event listeners to add the key and to remove the key when pressed up.

```
window.addEventListener('keydown', function(e) {
    keys[e.key] = true;
});
window.addEventListener('keyup', function(e) {
    delete keys[e.key];
});

```
The `changeDirection()` function checks if a key is in the keys object and updates the direction if there is no keys just calls `moveDirection`.

```
 else if ((keys['d'] || keys['ArrowRight']) && snake.direction != 'left') {
        snake.direction = 'right';
        moveDirection(snake.direction);
    }
    else {
        moveDirection(snake.direction);
    }

```

In the `moveDirection` function we copy the head of the snake and put it in it's position so the firts to elements of the body of the snake are equal, then we use the `movements` function to change the position of the new head and then we check if the snake hit a body part and call `gameOver` function or hit a food and add one point to the score or if we hit nothig we pop the last element of the snake so the snake keeps the same size unless it eats a food.

```
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
```
`checkCollision` checks if the x and y position of two objects are equal.
```
function checkCollision(objOne, objTwo) {
    if (objOne != objTwo && objOne.x == objTwo.x && objOne.y == objTwo.y) {
        return true;
    }
};
```

 `snakeCollsion` checks if an object has a collision with some part of the snake's body.

```
function snakeCollision(thing) {
    for (let i = 0; i < snake.body.length; i++) {
        let part = snake.body[i];
        if (checkCollision(part, thing)) return true;
    }
}
```

The `gameOver` stops the snake and sets the score into a hidden input element and a p element so the player can see it, and removes the class from a form which has the buttons to save the score, play or go back to the menu and if you saved one score it will copy the name from your settings.

The canvas has touch functionality with `beginSliding` that saves the position of the pointer event when `'pointerdown'` and when `'pointerup'` with `stopSliding`  it compares the position at the start with the position at the end of the event and changes the direction of the snake.

```
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
```

Then we got the functions for the animation and the drawing of the food, snake, the grid if you set it on the settings and the snake and food decorations.

## search-schemes.html:
Here we got the template for the data gotten from the database in the `'/search-schemes'` we got the rows and for every row we create a div with a canvas that has data selector with the info of the color scheme, a p selector with the scheme title and a p for the name of the user who submited and a button with the id of the scheme so it can be copied. And if the rows is empty we send `No results found.`.

## shared-schemes.html:
In this template we got a big div that it's the same as the scoreboard one, we got an h1 for  the title, a text input for searching, a div where all the fetched data will go. then a script were we add the function for the input.
```
document.querySelector('#input').addEventListener('input', () => getSchemes());

async function getSchemes() {
    let response = await fetch('/search-schemes?q=' + input.value);
    let schemes = await response.text();
    box.innerHTML = schemes;
    if (schemes != 'No results found.') drawImages();
}
```
The `drawImages()` function grabs the divs that were gotten with the `getSchemes` function and goes for every one, grabing the color and drawing the game in every canvas that the div has.

```
function drawImages() {
    let collection = box.children
    for (let i = 0; i < box.childElementCount; i++) {
        let img = collection[i].firstElementChild;
        snake.color = img.dataset.skColor.split(',');
        food.color = img.dataset.fdColor;
        hasStroke = img.dataset.stroke;
        hasGrid = img.dataset.grid;
                
        img.style.backgroundColor = bgColor = img.dataset.bkgColor;

        drawSquares(20);
        drawCanvas();
        img.getContext('2d').drawImage(canvas, 0, 0);
    }
}
```
And at the end we got the button to go back to the main menu.
