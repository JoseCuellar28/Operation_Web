import shutil
import os

SOURCE = "/Users/josearbildocuellar/Github/Operation_Web-1/frontend/Modelo_Funcional"
DEST = "/Users/josearbildocuellar/Github/Operation_Web-1/OperationWeb.API/wwwroot"

def restore_assets():
    if not os.path.exists(SOURCE):
        print(f"CRITICAL: Source directory {SOURCE} does not exist!")
        return

    if not os.path.exists(DEST):
        os.makedirs(DEST)
        print(f"Created {DEST}")

    # Files to copy explicitly to ensure they aren't missed
    files = ["index.html", "config.js", "menu_moderno.html", "hse_dashboard.html", "reset-password.html"]
    
    for f in files:
        src_path = os.path.join(SOURCE, f)
        dst_path = os.path.join(DEST, f)
        if os.path.exists(src_path):
            shutil.copy2(src_path, dst_path)
            print(f"Copied {f}")
        else:
            print(f"Warning: {f} not found in source")

    # Directories to copy
    dirs = ["css", "js", "img", "mock_data"]
    for d in dirs:
        src_path = os.path.join(SOURCE, d)
        dst_path = os.path.join(DEST, d)
        if os.path.exists(src_path):
            if os.path.exists(dst_path):
                shutil.rmtree(dst_path) # Clean replace to avoid stale files
            shutil.copytree(src_path, dst_path)
            print(f"Copied directory {d}")
        else:
            print(f"Warning: directory {d} not found in source")
            
    # Force config.js to localhost
    config_path = os.path.join(DEST, "config.js")
    with open(config_path, "w") as f:
        f.write("window.APP_CONFIG = { API_URL: 'http://localhost:5132' };\nconsole.log('✅ Localhost Configuration Loaded (Forced)');")
    print("Forced config.js to localhost:5132")

if __name__ == "__main__":
    restore_assets()
