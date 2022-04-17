import json
import requests
import datetime
from flask import Blueprint, jsonify, request
from mydb import get_error_message, save_payment_record, get_trade_info, get_contact, Attraction
import os
from mydb import create_account, is_the_account_exist, is_the_account_currect, get_user_info, attraction_booking, get_booking_info, delete_schedule
from flask_jwt_extended import set_access_cookies
from flask_jwt_extended import unset_jwt_cookies
from flask_jwt_extended import create_access_token, decode_token
import time

partner_key = os.getenv('PARTNER_KEY')

app2 = Blueprint('app2', __name__)

my_attraction = Attraction()

@app2.route('/attractions')
def show_attractions():
    page = int(request.args.get('page'))
    keyword = request.args.get('keyword')
    if(page >= 0):
        response = my_attraction.get_attraction(page=page, keyword=keyword)
    else:
        message = "ArgsError: page number is positive"
        response = get_error_message(message)

    return response

@app2.route('/attraction/<attractionId>')
def search_for_attraction_byId(attractionId):
    if(int(attractionId) > 0):
        response = my_attraction.get_attraction(id=int(attractionId))
    else:
        message = "ArgsError: id number is positive and not zero"
        response = get_error_message(message)
    return response

@app2.route('/orders', methods=['POST'])
def payment():
    if(request.method == 'POST'):
        data = eval(request.get_data())
        if(data['contact']['name'] != None and data['contact']['name'] != ''):
            if(data['contact']['email'] != None and data['contact']['email'] != ''):
                tappay_request = {
                    "prime":data['prime'],
                    "partner_key": partner_key,
                    "merchant_id": "GlobalTesting_CTBC",
                    "amount": 1,
                    "currency": "TWD",
                    "details":"an order",
                    "cardholder": {
                        "phone_number": data['contact']['phone'],
                        "name": data['contact']['name'],
                        "email": data['contact']['email']
                    },
                    "remember": False
                }
                tappay_request = json.dumps(tappay_request)
                headers = {
                    'x-api-key':partner_key,
                    'content-type':'application/json'
                }
                res = requests.post('https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime', data=tappay_request, headers=headers)
                result = json.loads(res.text)
                time = datetime.datetime.now()
                time = time.strftime("%Y%m%d%H%M%S")
                if(result['status'] == 0):
                    save_payment_record(data['contact'], time, True)
                    response = {
                        "data":{
                            "number": time,
                            "payment":{
                                "status":result['status'],
                                "message":"付款成功"
                            }
                        }
                    }
                else:
                    save_payment_record(data['contact'], time, False)
                    response = {
                        "error":True,
                        "message":{"msg":result['msg'], "number":time}
                    }
    return jsonify(response)

@app2.route('/orders/<orderNumber>', methods=['GET'])
def order(orderNumber):
    data = get_trade_info(orderNumber)
    cookie = request.cookies.get('access_token_cookie')
    c = decode_token(cookie)
    print(data)
    if(data != []):
        attraction = my_attraction.get_attraction(id=int(data[1])).json['data']
        user = get_contact(data[0])
        response = {
            "data":{
                "number":data[6],
                "price":int(data[4]),
                "trip":{
                    "attraction":{
                        "id":attraction['id'],
                        "name":attraction['name'],
                        "address":attraction['address'],
                        "image":attraction['images']
                    }
                }
            },
            "contact":{
                "name":user['name'],
                "email":user['email'],
                "phone":user['phone']
            },
            "status":data[5]
        }
    else:
        response = {
            "error":True,
            "message":"訂單編號有誤"
        }
    return jsonify(response)

@app2.route('/user', methods=['GET', 'POST', 'PATCH', 'DELETE'])
def member():
	if(request.method == 'GET'):
		cookie = request.cookies.get('access_token_cookie')
		if(cookie != None):
			email = decode_token(cookie)['sub']
			data = get_user_info(email)
			response = jsonify({"data":data})
		else:
			response = jsonify({"data":None})

	elif(request.method == 'POST'):
		data = eval(request.get_data())
		email = data['email']

		if(email != None and email != ''):
			if(is_the_account_exist(email) != True):
				name = data['name']
				password = data['password']
				create_account(name, email, password)
				response = jsonify({"ok":True})
			else:
				response = jsonify({"error":True, "message":"該 Email 已被註冊"})
		else:
			response = jsonify({"error":True, "message":"Email 格式有誤"})	
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
	return response

@app2.route('/booking', methods=['GET', 'POST', 'DELETE'])
def api_booking():
	if(request.method == 'POST'):
		data = eval(request.get_data())	
		if(data['date'] == ''):
			msg = "請選擇日期"
			response = {"error":True, "message":msg}
		else:
			date = time.strptime(data['date'], "%Y-%m-%d")
			today = time.strptime(str(datetime.date.today()), "%Y-%m-%d")
			if(date < today):
				msg = "日期資訊有誤"
				response = {"error":True, "message":msg}
			else:
				cookie = request.cookies.get('access_token_cookie')
				if(cookie == None):
					msg = "尚未登入"
					response = {"error":True, "message":msg}

				else:
					email = decode_token(cookie)['sub']
					attraction_booking(email, data)
					response = {"ok":True}
		return jsonify(response)
	elif(request.method == 'GET'):
		cookie = request.cookies.get('access_token_cookie')
		
		if(cookie != None):
			email = decode_token(cookie)['sub']
			response = get_booking_info(email)
		else:
			response = {"error":True, "message":"尚未登入"}
	else:
		cookie = request.cookies.get('access_token_cookie')
		email = decode_token(cookie)['sub']
		response = delete_schedule(email)

	return jsonify(response)


    
    
    
    



