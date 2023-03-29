import datetime, os, cs50

from flask import Flask, render_template, request, flash, session, redirect

from utils import get_snake_colors, check_user_settings, validate_color, validate_name, get_checkbox, check_save_settings, get_speed_key, return_score, default_settings, speeds


app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY')
app.permanent_session_lifetime = datetime.timedelta(days=30)
app.config.update(
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_SAMESITE='Lax',
)


db = cs50.SQL("sqlite:///color-schemes.db")


@app.route("/", methods = ['GET'])
def index():
    if 'user' not in session:
        session['user'] = { 'settings': default_settings.copy(), 'scores': [], 'game_played': False }
        session.modified = True
        session.permanent = True

    session['game_played'] = False
    return render_template('index.html')
       

@app.route('/settings', methods=['GET'])
def settings():
    check_user_settings(session)
    session['game_played'] = False
    return render_template('settings.html', settings=session['user']['settings'], speeds=speeds)


@app.route('/save-settings', methods=['POST'])
def save_settings():
    check_save_settings(session)
    flash('Settings saved.')
    return redirect('/settings')


@app.route('/submit-settings', methods=['POST'])
def submit_settings():
    check_save_settings(session)

    grid = get_checkbox('grid')
    bd_stroke = get_checkbox('stroke')
    sk_colors = ",".join(get_snake_colors())
    fd_color = request.form.get('food-color')
    bg_color = request.form.get('background')
    name = request.form.get('username').lower()
    title = request.form.get('scheme').lower()

    if len(sk_colors) != 0 and validate_color(fd_color) and validate_color(bg_color) and validate_name(name) and validate_name(title):
        submited = db.execute('INSERT INTO settings (user, title, snake_colors, bg_color, food_color, grid, stroke) VALUES (?, ?, ?, ?, ?, ?, ?)', name, title, sk_colors, bg_color, fd_color, grid, bd_stroke)
        if not submited:
            flash('Could not submit.')
            return

        flash('Settings submited.')
    else:
        flash('Could not submit.')

    return redirect('/settings')


@app.route('/copy-scheme', methods=['POST'])
def copy_scheme():
    if request.form.get('scheme-id'):
        row = db.execute('SELECT snake_colors, food_color, bg_color, grid, stroke FROM settings WHERE id = ?', request.form.get('scheme-id'))[0]
        if row:
            check_user_settings(session)
            settings = session['user']['settings']
        
            settings['snake_colors'] = row['snake_colors'].split(',')
            settings['food_color'] = row['food_color']
            settings['background'] = row['bg_color']
            settings['grid'] = row['grid']
            settings['stroke'] = row['stroke']

            session.modified = True

            flash('Color scheme saved.')
        else:
            flash('Could not copy.')

    return redirect('shared-schemes')
    

@app.route('/search-schemes')
def search_schemes():
    search_term = "%" + request.args.get("q", "")  + "%"
    if search_term != "%" + "%":
        rows = db.execute('SELECT * FROM settings WHERE user LIKE ? OR title LIKE ? LIMIT 50',  search_term, search_term)
    else:
        rows = db.execute('SELECT * FROM settings ORDER BY RANDOM() LIMIT 50')
    
    return render_template('search-schemes.html', rows=rows)


@app.route('/shared-schemes')
def shared_schemes():
    return render_template('shared-schemes.html', settings=default_settings)


@app.route("/game", methods=["GET", "POST"])
def game():
    if request.method == "POST":
        check_save_settings(session)
        return redirect('/game')
    
    session['game_played'] = True
    check_user_settings(session)
    return render_template("game.html", settings=session['user']['settings'])


@app.route('/scoreboard', methods=['GET', 'POST'])
def scoreboard():
    if request.method == 'POST':
        # Get the name and score of the player
        settings = session['user']['settings']
        scores = session['user']['scores']
        score = request.form.get("score")
        name = request.form.get("name")

        if not validate_name(name):
            flash('Score not saved.')
        elif not score:
            flash('Could not retrieve score.')
        else:
            new_score = {
                'name': name, 
                'score': score, 
                'speed': get_speed_key(settings['speed']), 
                'grid_size': settings['grid_size'],
                'hardmode': settings['hardmode'] 
            }

            # Save the new score and sorted
            scores.append(new_score)
            scores.sort(reverse=True, key=return_score)

            # Save name for rapid typing after a game.
            if settings:
                settings['name'] = name

            session.modified = True

            return redirect('/scoreboard')

    check_user_settings(session)
    return render_template('scoreboard.html', scores=session['user']['scores'], game_played=session['game_played'])


@app.route('/delete-scores', methods=['GET', 'POST'])
def delete_scores():
    if request.method == 'POST':
        delete = request.form.get('score-delete')
        if delete:
            session['user']['scores'].pop(int(delete))
            session.modified = True

        return redirect('/delete-scores')

    return render_template('scoreboard.html', scores=session['user']['scores'], game_played=session['game_played'], editmode=True)


if __name__ == "__main__":
    app.run(debug=False, host='0.0.0.0')