import json
import requests
import datetime
from flask import Blueprint, jsonify, request
from mydb import get_attraction, get_attractions, get_error_message, save_payment_record, get_trade_info, get_contact
from flask_jwt_extended import decode_token
import os

partner_key = os.getenv('PARTNER_KEY')


app2 = Blueprint('app2', __name__)


@app2.route('/attractions')
def show_attractions():
    page = int(request.args.get('page'))
    keyword = request.args.get('keyword')

    if(page >= 0):
        response = get_attractions(page, keyword)
    else:
        message = "ArgsError: page number is positive"
        response = get_error_message(message)

    return response

@app2.route('/attraction/<attractionId>')
def search_for_attraction_byId(attractionId):
    if(int(attractionId) > 0):
        response = get_attraction(int(attractionId))
    else:
        message = "ArgsError: id number is positive and not zero"
        response = get_error_message(message)
    return response

@app2.route('/orders', methods=['POST'])
def payment():
    if(request.method == 'POST'):
        data = eval(request.get_data())
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
        attraction = get_attraction(int(data[1])).json['data']
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

    
    
    
    



