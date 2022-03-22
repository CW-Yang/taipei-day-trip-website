
from flask import *
from api import app2
from flask_jwt_extended import create_access_token, decode_token
from flask_jwt_extended import JWTManager
from flask_jwt_extended import set_access_cookies
from flask_jwt_extended import unset_jwt_cookies
from mydb import create_account, is_the_account_exit, is_the_account_currect, get_user_info

app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.config["JSON_SORT_KEYS"] = False



app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config["JWT_COOKIE_SECURE"] = False
app.config["JWT_SECRET_KEY"] = "secret"

jwt = JWTManager(app)


# Pages
@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")


@app.route('/api/user', methods=['GET', 'POST', 'PATCH', 'DELETE'])
def member():
	if(request.method == 'GET'):
		cookie = request.cookies.get('access_token_cookie')
		# print(decode_token(cookie)['sub'])
		email = decode_token(cookie)['sub']
		data = get_user_info(email)
		response = jsonify({"data":data})

	elif(request.method == 'POST'):
		data = eval(request.get_data())
		email = data['email']
		if(is_the_account_exit(email) != True):
			name = data['name']
			password = data['password']
			create_account(name, email, password)
			response = jsonify({"ok":True})
		else:
			response = jsonify({"error":True, "message":"該 Email 已被註冊"})	
	elif(request.method == 'PATCH'):
		data = eval(request.get_data())
		email = data['email']
		password = data['password']
		if(is_the_account_currect(email, password) == True):
			response = jsonify({"ok": True})
			access_token = create_access_token(identity=data['email'])
			set_access_cookies(response, access_token)
		else:
			response = jsonify({"error":True, "message":"Email 或密碼錯誤"})
	else:
		response = jsonify({"msg": "logout successful"})
		unset_jwt_cookies(response)
		print("登出")
	return response

app.register_blueprint(app2, url_prefix='/api')

app.run(port=3000, host='0.0.0.0')