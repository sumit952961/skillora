import os
import re

def walk_and_replace(dir_path):
    replacements = {
        r"['\"]#ffffff['\"]": "'var(--bg-secondary)'",
        r"['\"]#fff['\"]": "'var(--bg-secondary)'",
        r"['\"]white['\"]": "'var(--bg-secondary)'",
        
        r"['\"]#f8fafc['\"]": "'var(--bg-primary)'",
        r"['\"]#f8f9ff['\"]": "'var(--bg-primary)'",
        
        r"['\"]#e2e8f0['\"]": "'var(--border-color)'",
        r"['\"]#eef0ff['\"]": "'var(--border-color)'",
        
        r"['\"]#0f172a['\"]": "'var(--text-main)'",
        r"['\"]#000['\"]": "'var(--text-main)'",
        r"['\"]#333['\"]": "'var(--text-main)'",
        r"['\"]black['\"]": "'var(--text-main)'",
        
        r"['\"]#64748b['\"]": "'var(--text-muted)'",
        r"['\"]#475569['\"]": "'var(--text-muted)'",
        r"['\"]#888['\"]": "'var(--text-muted)'",
    }

    modified_files = 0

    for root, dirs, files in os.walk(dir_path):
        for file in files:
            if file.endswith('.jsx'):
                filepath = os.path.join(root, file)
                
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                original_content = content

                for pattern, replacement in replacements.items():
                    # We are looking for things like: background: '#fff'
                    # So the regex should just match the exact string tokens.
                    content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)

                if content != original_content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Modified: {filepath}")
                    modified_files += 1

    print(f"Total files modified: {modified_files}")

walk_and_replace('frontend/src')
