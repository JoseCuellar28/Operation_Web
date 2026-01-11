import shutil
import os

# Define exact paths
BASE_DIR = "/Users/josearbildocuellar/Github/Operation_Web-1"
SOURCE_DIR = os.path.join(BASE_DIR, "frontend/Modelo_Funcional")
DEST_DIR = os.path.join(BASE_DIR, "OperationWeb.API/wwwroot")

# Directories to copy
DIRS_TO_COPY = ["css", "js", "img"]

def copy_folders():
    print(f"Starting copy from {SOURCE_DIR} to {DEST_DIR}...")
    
    for folder in DIRS_TO_COPY:
        src = os.path.join(SOURCE_DIR, folder)
        dst = os.path.join(DEST_DIR, folder)
        
        if os.path.exists(src):
            # Remove destination if it exists to ensure clean copy
            if os.path.exists(dst):
                print(f"Removing existing {dst}...")
                shutil.rmtree(dst)
            
            # Copy tree
            print(f"Copying {src} -> {dst}...")
            shutil.copytree(src, dst)
            print(f"✅ Copied {folder} successfully.")
        else:
            print(f"❌ CRITICAL: Source folder {folder} not found at {src}")

if __name__ == "__main__":
    copy_folders()
