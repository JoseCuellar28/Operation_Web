import os
import pytds
from dotenv import load_dotenv

# Load environment variables from .env file in the same directory
load_dotenv()

def get_connection():
    server = os.getenv('DB_SERVER')
    user = os.getenv('DB_USER')
    password = os.getenv('DB_PASSWORD')
    database = os.getenv('DB_NAME')
    port = int(os.getenv('DB_PORT', '1433'))
    
    if not server:
        raise ValueError("DB_SERVER not set in .env")

    return pytds.connect(
        server=server,
        user=user,
        password=password,
        database=database,
        port=port,
        autocommit=True
    )
