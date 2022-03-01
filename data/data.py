from mysql.connector.pooling import MySQLConnectionPool
from mysql.connector import errors
import json
import re

config = {
    "host":"localhost",
    "user":"root",
    "password":"root",
    "database":"website"
}

connection_pool = MySQLConnectionPool(pool_name='my_connection_pool',
                                    pool_size=5,
                                    **config)


my_data_list = []

def bundle_up(data_tuple):
    my_data_list.append(data_tuple)

def string_split(string):
    lst = []
    last_index = 0
    for pos in re.finditer("http", string):
        current_index = pos.span()[0]
        if(current_index != 0):
            img = string[int(current_index-3):int(current_index)]
            if(img == 'jpg' or img == 'JPG'):
                lst.append(string[int(last_index):int(current_index)])
            elif(img == 'png' or img == 'PNG'):
                lst.append(string[int(last_index):int(current_index)])
            last_index = current_index
    return lst

# about MySQL
def connect_with_database(sql_command, value):
    try:
        my_connection = connection_pool.get_connection()
        my_cursor = my_connection.cursor()
        my_cursor.executemany(sql_command, value)
        my_connection.commit()

    except errors.Error as error:
        print(error)

    finally:
        my_cursor.close()
        my_connection.close()
        result = my_cursor.rowcount
    return result

def insert_data():
    command = "INSERT INTO attractions(id, name, category, descripition, address, transport, mrt, latitude, longitude, images) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
    value = my_data_list
    print(connect_with_database(command, value))


# open the json file
with open('taipei-attractions.json', encoding="UTF-8") as file:
    data = json.load(file)
    attractions_info = data['result']['results']
    for attraction in attractions_info:
        id = attraction['_id']
        name = attraction['stitle']
        cat = attraction['CAT2']
        description = attraction['xbody']
        address = attraction['address']
        transport = attraction['info']
        mrt = attraction['MRT']
        latitude = attraction['latitude']
        longitude = attraction['longitude']
        images = attraction['file']

        images = str(string_split(images))

        my_tuple = (id, name, cat, description, address, transport, mrt, latitude, longitude, images)
        bundle_up(my_tuple)
    insert_data()
    
    








    


    




