import re
import math
import sys

def hex_to_rgb(h):
    h = h.lstrip('#')
    if len(h) == 3:
        h = ''.join(c + c for c in h)
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def luminance(r, g, b):
    a = [c / 255.0 for c in (r, g, b)]
    a = [(c / 12.92) if c <= 0.03928 else math.pow((c + 0.055) / 1.055, 2.4) for c in a]
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722

def contrast_ratio(hex1, hex2):
    r1, g1, b1 = hex_to_rgb(hex1)
    r2, g2, b2 = hex_to_rgb(hex2)
    l1 = luminance(r1, g1, b1)
    l2 = luminance(r2, g2, b2)
    bright = max(l1, l2)
    dark = min(l1, l2)
    return (bright + 0.05) / (dark + 0.05)

def main():
    file_path = "src/explore/styles/tokens.js"
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Find the GLOBAL_CSS block
    css_match = re.search(r'export const GLOBAL_CSS = `(.*?)`;', content, re.DOTALL)
    if not css_match:
        print("Could not find GLOBAL_CSS")
        return
    css = css_match.group(1)

    # Find all blocks: selectors { definitions }
    blocks = re.findall(r'([^{]+)\s*{\s*([^}]+)\s*}', css)

    print("=== THEME CONTRAST REPORT ===")
    print(f"{'Theme & Mode':<30} | {'Contrast (Text/Bg)':<20} | {'Contrast (Bright/Card)':<20} | {'Status'}")
    print("-" * 90)

    for selector, body in blocks:
        selector = selector.strip()
        # Only check theme blocks (either :root or [data-theme...])
        if ':root' not in selector and '[data-theme' not in selector:
            continue
        
        # Determine theme name and mode
        theme = "standard"
        mode = "dark"
        if ':root' in selector:
            theme = "base (standard fallback)"
        else:
            m = re.search(r'\[data-theme="([^"]+)"\]', selector)
            if m:
                theme = m.group(1)
            
            m_mode = re.search(r'\[data-mode="([^"]+)"\]', selector)
            if m_mode:
                mode = m_mode.group(1)
            else:
                mode = "both/unknown"

        # Extract vars
        vars = dict(re.findall(r'(--[\w-]+):\s*#([0-9a-fA-F]{3,6})', body))
        
        bg = vars.get('--c-bg')
        text = vars.get('--c-text')
        bg_card = vars.get('--c-bgCard')
        text_bright = vars.get('--c-textBright')
        
        if bg and text:
            cr1 = contrast_ratio(bg, text)
            cr2 = contrast_ratio(bg_card, text_bright) if bg_card and text_bright else 0
            
            status = "FAIL"
            if cr1 >= 4.5 and cr2 >= 4.5:
                status = "PASS (AA)"
            if cr1 >= 7.0 and cr2 >= 7.0:
                status = "PASS (AAA)"
                
            cr1_str = f"{cr1:.2f}:1"
            cr2_str = f"{cr2:.2f}:1" if cr2 else "N/A"
            name = f"{theme} ({mode})"
            
            print(f"{name:<30} | {cr1_str:<20} | {cr2_str:<20} | {status}")

if __name__ == "__main__":
    main()
