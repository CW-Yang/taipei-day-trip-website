from flask import Blueprint, request
from mydb import get_attraction, get_attractions, get_error_message

app2 = Blueprint('app2', __name__)


@app2.route('/attractions')
def show_attractions():
    page = request.args.get('page')
    keyword = request.args.get('keyword')

    if(page > 0):
        response = get_attractions(page, keyword)
    else:
        message = "ArgsError: page number is positive"
        response = get_error_message(message)

    return response

@app2.route('/attraction/<attractionId>')
def search_for_attraction_byId(attractionId):
    if(attractionId > 0):
        response = get_attraction(attractionId)
    else:
        message = "ArgsError: id number is positive"
        response = get_error_message(message)
    
    return response
