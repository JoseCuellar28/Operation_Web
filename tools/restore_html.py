
import os
import shutil

SOURCE_DIR = "/Users/josearbildocuellar/Github/Operation_Web-1/frontend/Modelo_Funcional"
DEST_DIR = "/Users/josearbildocuellar/Github/Operation_Web-1/OperationWeb.API/wwwroot"

def copy_html_files():
    if not os.path.exists(SOURCE_DIR):
        print(f"Error: Source directory {SOURCE_DIR} not found.")
        return

    if not os.path.exists(DEST_DIR):
        os.makedirs(DEST_DIR)

    files_copied = 0
    for filename in os.listdir(SOURCE_DIR):
        if filename.endswith(".html"):
            src_path = os.path.join(SOURCE_DIR, filename)
            dest_path = os.path.join(DEST_DIR, filename)
            try:
                shutil.copy2(src_path, dest_path)
                print(f"Copied: {filename}")
                files_copied += 1
            except Exception as e:
                print(f"Error copying {filename}: {e}")
    
    # Also need to ensure internal HTML references in JS are correct, 
    # but primarily ensuring the files exist is the first step.
    print(f"Successfully copied {files_copied} HTML files to {DEST_DIR}")

if __name__ == "__main__":
    copy_html_files()
