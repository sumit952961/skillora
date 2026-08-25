import re

with open('frontend/src/App.css', 'r') as f:
    css = f.read()

# Safe replacements for hardcoded colors to CSS variables
replacements = {
    r'#ffffff': 'var(--bg-secondary)',
    r'#f8fafc': 'var(--bg-primary)',
    r'#e2e8f0': 'var(--border-color)',
    r'#0f172a': 'var(--text-main)',
    r'#64748b': 'var(--text-muted)',
    r'#475569': 'var(--text-muted)',
    r'#94a3b8': 'var(--text-light)',
    r'#f5f3ff': 'var(--primary-light)',
    r'#ede9fe': 'var(--border-color)',
    r'#cbd5e1': 'var(--border-color)',
    r'#334155': 'var(--text-main)',
    # The gradient in illustration-card
    r'linear-gradient\(180deg,\s*#f8faff\s*0%,\s*#f0f4ff\s*100%\)': 'linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)'
}

for pattern, replacement in replacements.items():
    # Use re.IGNORECASE for hex colors
    css = re.sub(pattern, replacement, css, flags=re.IGNORECASE)

with open('frontend/src/App.css', 'w') as f:
    f.write(css)

print("Colors fixed in App.css!")
