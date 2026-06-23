import os
import re

def contains_emoji(s):
    # Regex to match basic emojis (not perfect, but catches many)
    emoji_pattern = re.compile(
        "["
        "\U0001f600-\U0001f64f"  # emoticons
        "\U0001f300-\U0001f5ff"  # symbols & pictographs
        "\U0001f680-\U0001f6ff"  # transport & map symbols
        "\U0001f1e0-\U0001f1ff"  # flags (iOS)
        "\U00002702-\U000027b0"
        "\U000024c2-\U0001f251"
        "\u2600-\u26ff"
        "\u25b6"
        "\u23f1-\u23f3"
        "\u23f8-\u23fa"
        "]+", flags=re.UNICODE)
    return emoji_pattern.search(s) is not None

def search_files(directory):
    with open(r"d:\Dropbox\Accidental Intactivist\Repo\circumsurvey\scratch\emojis.txt", "w", encoding="utf-8") as out:
        for root, dirs, files in os.walk(directory):
            for file in files:
                if file.endswith(".jsx") or file.endswith(".js"):
                    filepath = os.path.join(root, file)
                    with open(filepath, 'r', encoding='utf-8') as f:
                        for i, line in enumerate(f):
                            if contains_emoji(line):
                                out.write(f"{file}:{i+1}: {line.strip()}\n")

search_files(r"d:\Dropbox\Accidental Intactivist\Repo\circumsurvey\src\explore")
