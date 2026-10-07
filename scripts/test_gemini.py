import os
import sys
from google import genai
from google.genai import types

api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    try:
        with open(".env.local", "r") as f:
            for line in f:
                if line.startswith("GEMINI_API_KEY="):
                    api_key = line.strip().split("=", 1)[1]
                    os.environ["GEMINI_API_KEY"] = api_key
                    break
    except:
        pass

client = genai.Client(api_key=api_key)

try:
    response = client.models.generate_content(
        model='gemini-3.6-flash',
        contents='Tell me about intactivism',
        config=types.GenerateContentConfig(
            tools=[{"google_search": {}}]
        )
    )
    print("Response text:")
    print(response.text)
    print("Response candidates:")
    print(response.candidates)
except Exception as e:
    print(f"Error: {e}")
