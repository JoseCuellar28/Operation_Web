import json
import os

LAUNCH_JSON_PATH = "/Users/josearbildocuellar/Github/Operation_Web-1/.vscode/launch.json"

def clean_launch_json():
    try:
        with open(LAUNCH_JSON_PATH, 'r') as f:
            data = json.load(f)
        
        configs = data.get("configurations", [])
        for config in configs:
            # Remove deprecated/unsupported keys causing warnings
            if "stopAtEntry" in config:
                del config["stopAtEntry"]
            if "sourceFileMap" in config:
                del config["sourceFileMap"]
            
            # Ensure our critical fix (port 5132) is preserved/enforced
            if config.get("name") == ".NET Core Launch (web)":
                 config["args"] = ["--urls", "http://localhost:5132"]
        
        with open(LAUNCH_JSON_PATH, 'w') as f:
            json.dump(data, f, indent=4)
        print("Cleaned launch.json and verified port arguments.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    clean_launch_json()
