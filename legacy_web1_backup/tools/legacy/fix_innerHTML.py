#!/usr/bin/env python3
"""
Script to replace .innerHTML with DOMPurify.sanitize() in JavaScript files
"""

import re
import sys

def fix_innerHTML(file_path):
    """Replace .innerHTML with DOMPurify.sanitize()"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Pattern 1: element.innerHTML = 'string'
    # Replace with: element.innerHTML = DOMPurify.sanitize('string')
    pattern1 = r'(\.innerHTML\s*=\s*)([\'"`])'
    replacement1 = r'\1DOMPurify.sanitize(\2'
    content = re.sub(pattern1, replacement1, content)
    
    # Pattern 2: element.innerHTML = `template`
    # Replace with: element.innerHTML = DOMPurify.sanitize(`template`)
    pattern2 = r'(\.innerHTML\s*=\s*)(`)([^`]*?)(`)'
    replacement2 = r'\1DOMPurify.sanitize(\2\3\4)'
    content = re.sub(pattern2, replacement2, content)
    
    # Pattern 3: element.innerHTML = variable
    # Replace with: element.innerHTML = DOMPurify.sanitize(variable)
    pattern3 = r'(\.innerHTML\s*=\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)'
    replacement3 = r'\1DOMPurify.sanitize(\2)'
    content = re.sub(pattern3, replacement3, content)
    
    # Count changes
    changes = content.count('DOMPurify.sanitize(') - original_content.count('DOMPurify.sanitize(')
    
    if changes > 0:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Fixed {changes} instances in {file_path}")
        return changes
    else:
        print(f"ℹ️  No changes needed in {file_path}")
        return 0

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 fix_innerHTML.py <file_path>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    changes = fix_innerHTML(file_path)
    print(f"\nTotal changes: {changes}")
