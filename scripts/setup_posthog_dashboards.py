import os
import json
import urllib.request
from urllib.error import HTTPError

# Manually parse .env.local to avoid missing dotenv dependency
with open('.env.local') as f:
    for line in f:
        if line.strip() and not line.startswith('#'):
            k, v = line.strip().split('=', 1)
            os.environ[k] = v

POSTHOG_API_KEY = os.environ.get('POSTHOG_PERSONAL_API_KEY')
PROJECT_ID = os.environ.get('POSTHOG_PROJECT_ID')

HOST = 'https://us.posthog.com'

def make_request(method, path, data=None):
    url = f"{HOST}{path}"
    headers = {
        'Authorization': f'Bearer {POSTHOG_API_KEY}',
        'Content-Type': 'application/json'
    }
    
    req_data = None
    if data is not None:
        req_data = json.dumps(data).encode('utf-8')
        
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except HTTPError as e:
        print(f"Error {e.code}: {e.read().decode()}")
        return None

print("Testing authentication with Project Secret Key...")
dashboard_data = {
    "name": "Intactivist.guide Command Center",
    "description": "Auto-generated metrics for the Digital Library and Archive.",
    "use_template": ""
}

# Try app.posthog.com first
HOST = 'https://app.posthog.com'
res = make_request('POST', f'/api/projects/{PROJECT_ID}/dashboards/', dashboard_data)

if not res:
    print("Trying eu.posthog.com...")
    HOST = 'https://eu.posthog.com'
    res = make_request('POST', f'/api/projects/{PROJECT_ID}/dashboards/', dashboard_data)
    
if not res:
    print("Trying us.posthog.com...")
    HOST = 'https://us.posthog.com'
    res = make_request('POST', f'/api/projects/{PROJECT_ID}/dashboards/', dashboard_data)

if not res:
    print("Failed to authenticate or create dashboard with the provided key.")
    exit(1)

print(f"Authenticated successfully on {HOST}!")

dashboard_id = res['id']
print(f"Created Dashboard ID: {dashboard_id}")

insight_1 = {
    "name": "Archive Document Views",
    "description": "Tracks the 'Opened Document' event",
    "dashboards": [dashboard_id],
    "query": {
        "kind": "InsightVizNode",
        "source": {
            "kind": "TrendsQuery",
            "series": [{"kind": "EventsNode", "event": "Opened Document"}],
            "trendsFilter": {"display": "ActionsLineGraph"}
        }
    }
}
make_request('POST', f'/api/projects/{PROJECT_ID}/insights/', insight_1)
print("Insight 1 created: Archive Document Views")

insight_2 = {
    "name": "Report Generation Funnel",
    "description": "Tracks users building a report to completion",
    "dashboards": [dashboard_id],
    "query": {
        "kind": "InsightVizNode",
        "source": {
            "kind": "FunnelsQuery",
            "series": [
                {"kind": "EventsNode", "event": "Added to Report"},
                {"kind": "EventsNode", "event": "Exported Report"}
            ]
        }
    }
}
make_request('POST', f'/api/projects/{PROJECT_ID}/insights/', insight_2)
print("Insight 2 created: Report Generation Funnel")

insight_3 = {
    "name": "Semantic Searches Performed",
    "description": "Tracks the volume of AI-powered searches",
    "dashboards": [dashboard_id],
    "query": {
        "kind": "InsightVizNode",
        "source": {
            "kind": "TrendsQuery",
            "series": [{"kind": "EventsNode", "event": "Performed Semantic Search"}],
            "trendsFilter": {"display": "ActionsBarValue"}
        }
    }
}
make_request('POST', f'/api/projects/{PROJECT_ID}/insights/', insight_3)
print("Insight 3 created: Semantic Searches Performed")

print("\n--- Success! ---")
print("Dashboards and Insights have been created in your PostHog project.")
