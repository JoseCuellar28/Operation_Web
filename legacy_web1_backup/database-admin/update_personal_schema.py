import pytds
import os
from dotenv import load_dotenv
import logging

logging.basicConfig(level=logging.INFO)
load_dotenv()

def update_schema():
    try:
        conn = pytds.connect(
            server=os.getenv('DB_SERVER'),
            database=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            port=1433,
            autocommit=True
        )
        cursor = conn.cursor()
        
        logging.info("Updating Personal table schema...")
        cursor.execute("ALTER TABLE Personal ALTER COLUMN Estado NVARCHAR(50)")
        logging.info("Successfully updated Estado column to NVARCHAR(50)")
        
        conn.close()
    except Exception as e:
        logging.error(f"Error updating schema: {e}")

if __name__ == "__main__":
    update_schema()
