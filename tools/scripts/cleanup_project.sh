#!/bin/bash

echo "=== OperationWeb Project Cleanup ==="
echo "This script will remove temporary build files, logs, and system metadata."

# 1. Clean .NET Build Artifacts (bin/obj)
echo "Cleaning .NET build artifacts (bin/obj)..."
find . -type d -name "bin" -exec rm -rf {} +
find . -type d -name "obj" -exec rm -rf {} +

# 2. Clean Log Files
echo "Cleaning log files (*.log)..."
find . -type f -name "*.log" -delete

# 3. Clean System Metadata (.DS_Store)
echo "Cleaning .DS_Store files..."
find . -type f -name ".DS_Store" -delete

# 4. Clean Python Cache (if any)
echo "Cleaning Python __pycache__..."
find . -type d -name "__pycache__" -exec rm -rf {} +

echo "=== Cleanup Complete ==="
echo "Disk space reclaimed. Please rebuild the project using 'dotnet build'."
