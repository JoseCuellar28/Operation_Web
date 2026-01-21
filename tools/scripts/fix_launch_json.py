import json
import os

LAUNCH_JSON_PATH = "/Users/josearbildocuellar/Github/Operation_Web-1/.vscode/launch.json"

def fix_launch_json():
    content = {
        "version": "0.2.0",
        "configurations": [
            {
                "name": ".NET Core Launch (web)",
                "type": "coreclr",
                "request": "launch",
                "preLaunchTask": "build",
                "program": "${workspaceFolder}/OperationWeb.API/bin/Debug/net8.0/OperationWeb.API.dll",
                "args": ["--urls", "http://localhost:5132"],
                "cwd": "${workspaceFolder}/OperationWeb.API",
                "stopAtEntry": False,
                "serverReadyAction": {
                    "action": "openExternally",
                    "pattern": "\\bNow listening on:\\s+(https?://\\S+)"
                },
                "env": {
                    "ASPNETCORE_ENVIRONMENT": "Development"
                },
                "sourceFileMap": {
                    "/Views": "${workspaceFolder}/Views"
                }
            },
            {
                "name": ".NET Core Attach",
                "type": "coreclr",
                "request": "attach"
            }
        ]
    }
    
    with open(LAUNCH_JSON_PATH, 'w') as f:
        json.dump(content, f, indent=4)
        print(f"Successfully updated {LAUNCH_JSON_PATH}")

if __name__ == "__main__":
    fix_launch_json()
