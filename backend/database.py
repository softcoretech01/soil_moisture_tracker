import pymysql
import pymysql.cursors
from typing import Generator
import os

def get_db_connection():
    server = os.getenv("DB_SERVER", "localhost")
    database = os.getenv("DB_NAME", "soil_moisture_db")
    username = os.getenv("DB_USER", "root")
    password = os.getenv("DB_PASSWORD", "Hunter@2334")
    
    conn = pymysql.connect(
        host=server,
        user=username,
        password=password,
        database=database,
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
    )
    return conn

def get_db_cursor() -> Generator:
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        yield cursor
    finally:
        cursor.close()
        conn.close()
