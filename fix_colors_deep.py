import os
import re

def walk_and_replace(dir_path):
    # Regex mappings
    replacements = {
        # Semi-transparent backgrounds
        r"['\"]rgba\(0,\s*0,\s*0,\s*0\.[0-9]+\)['\"]": "'var(--bg-primary)'",
        r"['\"]rgba\(255,\s*255,\s*255,\s*0\.[0-9]+\)['\"]": "'var(--bg-secondary)'",
        
        # Specific hexes from Contests / Tasks / Arena
        r"['\"]#10b981['\"]": "'var(--accent-success)'",
        r"['\"]#059669['\"]": "'var(--accent-success)'",
        r"['\"]#ef4444['\"]": "'var(--accent-danger)'",
        r"['\"]#b91c1c['\"]": "'var(--accent-danger)'",
        
        # Linear Gradients with hex
        r"linear-gradient\(.*?#1e3a8a.*?\)": "var(--bg-secondary)",
        r"linear-gradient\(.*?#10b981.*?\)": "var(--accent-success)",
        r"linear-gradient\(.*?#3b82f6.*?\)": "var(--primary)",
        r"linear-gradient\(135deg,.*?#FF6B6B.*?\)": "var(--primary)",
        r"linear-gradient\(to right,.*?#facc15.*?\)": "var(--accent-warning)",
        
        # Residual hexes
        r"['\"]#facc15['\"]": "'var(--accent-warning)'",
        r"['\"]#eab308['\"]": "'var(--accent-warning)'",
    }

    modified_files = 0

    for root, dirs, files in os.walk(dir_path):
        for file in files:
            if file.endswith('.jsx') or file.endswith('.css'):
                filepath = os.path.join(root, file)
                
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                original_content = content

                for pattern, replacement in replacements.items():
                    content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)

                if content != original_content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Modified: {filepath}")
                    modified_files += 1

    print(f"Total files modified: {modified_files}")

walk_and_replace('frontend/src')
