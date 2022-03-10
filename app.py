import os
import setting
from mysql.connector.pooling import MySQLConnectionPool
from mysql.connector import errors
from flask import Flask

app = Flask(__name__)

host = os.getenv("DB_HOST")
user = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD")
database = os.getenv("DB_SCHEMA")

config={
    "host":host,
    "user":user,
    "password":password,
    "database":database
}

connection_pool = MySQLConnectionPool(pool_name='my_connection_pool', pool_size=5, **config)

@app.route('/')
def main():
    mydb = connection_pool.get_connection()
    my_cursor = mydb.cursor()
    my_cursor.execute("SELECT name FROM attractions")
    result = my_cursor.fetchall()

    for data in result:
        print(data)
    
    mydb.close()
    my_cursor.close()
    
    return("hi")

app.run()