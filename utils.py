import re
from flask import request, flash

speeds = {"SLOW": 15, "MEDIUM": 20, "FAST": 30}

default_settings = {
    "name": "Player",
    "snake_colors": ["#c8e14e", "#72ec23"],
    "food_color": "#ee5230",
    "background": "#808080",
    "hardmode": False,
    "grid": 'on',
    "grid_size": 30,
    "speed": speeds['MEDIUM'],
    'stroke': False,
}

# Validate colors values regex from here:
# https://stackoverflow.com/questions/30241375/python-how-to-check-if-string-is-a-hex-color-code
# Check how many colors the snake have:
hex_pattern = re.compile(r'^#(?:[0-9a-fA-F]{1,2}){3}$') 


def return_score(e):
    return int(e['score'])


def get_speed_key(speed):
    for key in speeds.keys():
        if speeds[key] == speed:
            return key


def check_user_settings(session):
    if 'user' not in session:
        session['user']['settings'] = default_settings.copy()
        session['user']['scores'] = []
    else:
        for key in default_settings.keys():
            if key not in session['user']['settings']:
                session['user']['settings'][key] = default_settings[key]
        

def validate_name(name):
    if not name:
        flash('Need a name to save the score.')
        return False
    if len(name) > 24:
        flash('Name too long.')
        return False
    if len(name) < 3:
        flash('Name too short.')
        return False
    if not name.replace(" ", "").isalnum():
        flash('Put alphanumeric names only.')
        return False
    if name.isdigit():
        flash('Name must have some letters.')
        return False
    
    return True


def validate_color(hex):
    if hex and hex_pattern.search(hex) != None:
        return True
    else:
        return False


def get_checkbox(id):
    # Check hardmode:
    if request.form.get(id) == 'on':
        return request.form.get(id)
    else:
        return False


def get_grid_size():
    grid_size = request.form.get('grid-size')
    if grid_size and grid_size.isdigit() and int(grid_size) >= 10 and int(grid_size) <= 100:
        return int(grid_size) - (int(grid_size) % 10)
    else:
        flash('Invalid grid size.')
        return False


def get_speed():
    speed = request.form.get('speed')
    if speed and speed in speeds.keys():
        return speeds[speed]
    else:
        flash('Invalid speed')
        return False


def get_snake_colors():
    snake_colors = []

    # Check Snake Colors:
    for i in range(3):
        string = "snake-color" + str(i)
        color = request.form.get(string)
        if color and validate_color(color):
            snake_colors.append(color)
        elif color != None:
            flash("Error with color ", i)
            return []

    return snake_colors


def check_save_settings(session):
    settings = session['user']['settings']

    sk_colors = get_snake_colors()
    fd_color = request.form.get('food-color')
    bg_color = request.form.get('background')
    grid_size = get_grid_size()
    speed = get_speed()
    
    settings['grid'] = get_checkbox('grid')
    settings['hardmode'] = get_checkbox('hardmode')
    settings['stroke'] = get_checkbox('stroke')

    # Check snake colors
    if len(sk_colors) != 0:
        settings['snake_colors'] = sk_colors
    else:
        flash('Invalid snake color.')

    # Check food color
    if fd_color and validate_color(fd_color):
        settings['food_color'] = fd_color
    else:
        flash('Invalid food color.')

    # Check background color
    if bg_color and validate_color(bg_color):
        settings["background"] = bg_color
    else:
        flash("Invalid background color.")

    # Check grid size:
    if grid_size:
        settings['grid_size'] = grid_size
    
    # Check speed:
    if speed:
        settings['speed'] = speed
        
    session.modified = True
