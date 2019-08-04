from bottle import route, run, template, static_file, post, get, request, response, delete, jinja2_view, redirect
import json
import pymysql
from uuid import uuid4
import hashlib
import functools

connection = pymysql.connect(
    host="localhost",
    user="root",
    password="root",
    db="paint",
    charset="utf8",
    cursorclass=pymysql.cursors.DictCursor
)

view = functools.partial(jinja2_view, template_lookup=['./'])


@route('/static/css/<filename:re:.*\.css>')
def getCss(filename):
    return static_file(filename,  root='static/css')


@get('/static/js/<filename:re:.*\.js>')
def javascripts(filename):
   return static_file(filename, root='static/js')


@get('/static/lib/<filename:re:.*\.js>')
def lib(filename):
   return static_file(filename, root='static/lib')


@get('/')
def index():
    username = request.get_cookie("username")
    session_id = request.get_cookie("session_id")
    res = static_file("/index.html", root="")
    if not is_user_logged_in(username, session_id):
        res.set_cookie('session_id', '', expires=0)
        res.set_cookie('username', '', expires=0)
    return res


@post('/save')
def save_painting():
    username = request.get_cookie("username")
    name = request.json.get("name")
    painting = json.dumps(request.json.get("painting"))
    try:
        with connection.cursor() as cursor:
            query = "INSERT INTO paintings (username, name, painting) values ('{}', '{}', '{}' )".format(
                username,
                name,
                painting
            )
            cursor.execute(query)
            connection.commit()
            return {"saved": True}
    except Exception as e:
        print(e)
        response.status = 500
        response["status__line"] = "error saving painting in the DB"
        return response


@delete('/delete')
def delete_painting():
    username = request.get_cookie("username")
    name = request.query.get("name")
    try:
        with connection.cursor() as cursor:
            query = "DELETE FROM paintings WHERE username='{}' and name='{}' ".format(username, name)
            cursor.execute(query)
            connection.commit()
            return response
    except Exception as e:
        print(e)
        response.status = 500
        response["status__line"] = "error writing to DB on save"
        return response


@get('/paintings')
def get_paintings():
    username = request.get_cookie("username")
    try:
        with connection.cursor() as cursor:
            query = "SELECT name from paintings where username='{}'".format(username)
            cursor.execute(query)
            paintings = cursor.fetchall()
            return json.dumps({"paintings": paintings})
    except Exception as e:
        print(e)
        return json.dumps("error writing to DB")


@get('/painting')
def get_painting():
    username = request.get_cookie("username")
    name = request.query.name
    try:
        with connection.cursor() as cursor:
            query = "SELECT painting from paintings where username='{}' and name='{}'".format(username, name)
            cursor.execute(query)
            painting = cursor.fetchone()
            return json.dumps(painting)
    except Exception as e:
        print(e)
        return json.dumps("error writing to DB")


@post('/login')
def signup():
    username = request.forms.get("username")
    password = request.forms.get("password")
    hashed_password = hash_password(password)
    session_id = request.get_cookie("session_id")
    new_session_id = get_user_session_id()
    if is_user_logged_in(username, session_id):
        return template('index.html')
    if not is_user_exist(username, hashed_password):
        add_new_user(username, hashed_password, new_session_id)
    update_user_session(username, hashed_password, new_session_id)
    response.set_cookie("session_id", new_session_id)
    response.set_cookie("username", username)
    redirect('/')


def get_user_session_id():
    return uuid4().hex[:8]


def hash_password(password):
    salt = "13Ebu54"
    return hashlib.md5((salt + password).encode('utf-8')).hexdigest()


def is_user_logged_in(username, session_id):
    if not session_id:
        return False
    try:
        with connection.cursor() as cursor:
            query = "SELECT * FROM users WHERE username = '{}' AND sessionId = '{}'".format(
                username, session_id)
            cursor.execute(query)
            result = cursor.fetchone()
            return result is not None
    except Exception as e:
        print(e)
        return False


def is_user_exist(username, password):
        try:
            with connection.cursor() as cursor:
                query = "SELECT * FROM users WHERE username = '{}' AND password = '{}'".format(
                    username, password)
                cursor.execute(query)
                result = cursor.fetchone()
                return result is not None
        except Exception:
            return False


def add_new_user(username, password, session_id):
    try:
        with connection.cursor() as cursor:
            query = "INSERT INTO users (username, password, sessionId) values ('{}', '{}', '{}' )".format(
                username,
                password,
                session_id
            )
            cursor.execute(query)
            connection.commit()
    except Exception as e:
        print(e)
        return json.dumps("error writing to DB")


def update_user_session(username, password, session_id):
    try:
        with connection.cursor() as cursor:
            query = "UPDATE users SET sessionId = '{}' WHERE username = '{}' AND password = '{}'".format(
                session_id, username, password)
            cursor.execute(query)
            connection.commit()
    except Exception as e:
        print(e)


if __name__ == "__main__":
    run(host='localhost', port=8000, reloader=True)
