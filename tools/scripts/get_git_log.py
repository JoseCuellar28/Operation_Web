import subprocess
import datetime

def get_git_log():
    try:
        # Get log for last 10 commits with date and message
        result = subprocess.run(
            ['git', 'log', '-n', '20', '--pretty=format:%h|%ad|%s', '--date=short'],
            capture_output=True,
            text=True,
            check=True
        )
        print("--- GIT LOG START ---")
        print(result.stdout)
        print("--- GIT LOG END ---")
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")
        print(e.stderr)

if __name__ == "__main__":
    get_git_log()
