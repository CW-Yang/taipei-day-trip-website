from pickle import FALSE
from click import command
from flask import jsonify
from idna import valid_contextj
from mysql.connector.pooling import MySQLConnectionPool
from mysql.connector import errors
import setting
import os

host_name = os.getenv('DB_HOST')
user = os.getenv('DB_USER')
password = os.getenv('DB_PASSWORD')
database = os.getenv('DB_SCHEMA')

config = {
    "host":host_name,
    "user":user,
    "password":password,
    "database":database
}

connection_pool = MySQLConnectionPool(pool_name='my_connection_pool',
                                    pool_size=5,
                                    **config)

def connect_with_database(command, value, insert_flag):
    try:
        my_connection = connection_pool.get_connection()
        my_cursor = my_connection.cursor()
        my_cursor.execute(command, value)
        if(insert_flag == True):
            my_connection.commit()
        data_count = my_cursor.rowcount
    except errors.Error as error:
        print(error)
    
    finally:
        result = my_cursor.fetchall()
        my_cursor.close()
        my_connection.close()
        return result

def counting_data_length():
    my_connection = connection_pool.get_connection()
    my_cursor = my_connection.cursor()
    my_cursor.execute("SELECT COUNT(*) FROM attractions")
    count = my_cursor.fetchone()[0]

    my_cursor.close()
    my_connection.close()
    return count    

def data_formatting(data):
    
    result = {
        "id":data[1],
        "name":data[2],
        "category":data[3],
        "descripition":data[4],
        "address":data[5],
        "transport":data[6],
        "mrt":data[7],
        "latitude":data[8],
        "longitude":data[9],
        "images":eval(data[10])  
    }
    #print(result)
    return result

# public function
def get_attractions(page, keyword):
    data_length = counting_data_length()
    nextPage = 1
    result = []
    count = 0

    if(keyword != None):
        value = ("%"+keyword+"%", )
        command = "SELECT COUNT(*) FROM attractions WHERE name LIKE %s"
        count = connect_with_database(command, value, FALSE)[0][0]
        pages = int(count/12)+1
        #print(pages)
        if(page < pages):
            if(count < 12):
                nextPage = None
                command = "SELECT * FROM attractions WHERE name LIKE %s"
                data = connect_with_database(command, value, FALSE)
                for i in data:
                    result.append(data_formatting(i))

            else:
                nextPage = page + 1
                start_index = (page*12)
                end_index = 12*(page+1)
                if(end_index > count):
                    end_index =  count
                    nextPage = None
                value = ("%"+keyword+"%", start_index, end_index)
                command = "SELECT * FROM attractions WHERE name LIKE %s ORDER BY id LIMIT %s,%s"
                data = connect_with_database(command, value, FALSE)
                for i in data:
                    result.append(data_formatting(i))   
        else:
            nextPage = None          
    else:
        nextPage = page + 1     
        start_index = (page*12) + 1
        end_index = ((page+1)*12)

        if(end_index > data_length):
            end_index = data_length
            nextPage = None
       
        value = (start_index, end_index)
        command = "SELECT * FROM attractions WHERE number >= %s AND number <= %s"
        data = connect_with_database(command, value, FALSE)

        for i in data:
            result.append(data_formatting(i))
        
    response = {
        "nextPage":nextPage,
        "data":result
    }
    #print(response)
    response = jsonify(response)
    return response

def get_attraction(id):
    value = (id, )
    command = "SELECT * FROM attractions WHERE number = %s"
    data = connect_with_database(command, value, FALSE)
    if(data != []):
        result = data_formatting(data[0])
        
        response = {
            "data": result
        }
    else:
        response = {
            "error":True,
            "message":"The id number is over range"
        }
    response = jsonify(response)
    return response

def get_error_message(message):
    response = {
        "error":True,
        "message":message
    }
    response = jsonify(response)
    return response

def create_account(name, email, password):
    command = 'INSERT INTO trip_member(name, email, password) VALUES(%s, %s, %s)'
    value = (name, email, password)
    connect_with_database(command, value, True)
    

def is_the_account_exit(email):
    command = 'SELECT * FROM trip_member WHERE email = %s'
    value = (email, )
    data = connect_with_database(command, value, False)
    print(data)
    if(data != []):
        return True
    return False

def is_the_account_currect(email, password):
    command = 'SELECT * FROM trip_member WHERE email = %s AND password = %s'
    value = (email, password)
    data = connect_with_database(command, value, False)
    if(data != []):
        return True
    return False

def get_user_info(email):
    command = "SELECT * FROM trip_member WHERE email = %s"
    value = (email, )
    data = connect_with_database(command, value, False)
    return {"id":data[0][0], "name":data[0][1], "email":data[0][2]}
