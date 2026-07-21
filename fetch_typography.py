#!/usr/bin/env python3
"""Fetch all typography/heading text nodes from Figma via MCP."""
import json
import urllib.request
import threading
import time

def query_typography_section():
    base_url = "http://127.0.0.1:3845"
    sse_url = f"{base_url}/sse"
    req = urllib.request.Request(sse_url, headers={'Accept': 'application/json, text/event-stream'})

    endpoint_url = None
    ep_event = threading.Event()
    responses = {}
    response_events = {}

    def sse_listener():
        nonlocal endpoint_url
        try:
            with urllib.request.urlopen(req) as response:
                current_event = None
                for line in response:
                    line_str = line.decode('utf-8').strip()
                    if not line_str or line_str.startswith(":"):
                        continue
                    if line_str.startswith("event: "):
                        current_event = line_str[7:].strip()
                    elif line_str.startswith("data: "):
                        data_content = line_str[6:].strip()
                        if current_event == "endpoint":
                            post_path = data_content.strip('"')
                            endpoint_url = post_path if post_path.startswith("http") else f"{base_url}{post_path}"
                            ep_event.set()
                        elif current_event == "message":
                            try:
                                msg_data = json.loads(data_content)
                                if "id" in msg_data and msg_data["id"] is not None:
                                    msg_id = msg_data["id"]
                                    responses[msg_id] = msg_data
                                    if msg_id in response_events:
                                        response_events[msg_id].set()
                            except Exception:
                                pass
        except Exception as e:
            print(f"SSE Error: {e}")
            ep_event.set()

    t = threading.Thread(target=sse_listener)
    t.daemon = True
    t.start()
    ep_event.wait(timeout=5)

    if not endpoint_url:
        print("ERROR: No endpoint URL received")
        return

    headers = {'Content-Type': 'application/json'}

    def send_post(payload):
        req_post = urllib.request.Request(endpoint_url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')
        try:
            with urllib.request.urlopen(req_post) as resp:
                resp.read()
                return True
        except Exception as e:
            print(f"POST failed: {e}")
            return False

    # Initialize
    init_payload = {"jsonrpc": "2.0", "id": 100, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "py", "version": "1"}}}
    response_events[100] = threading.Event()
    send_post(init_payload)
    response_events[100].wait(timeout=5)
    send_post({"jsonrpc": "2.0", "method": "notifications/initialized"})
    time.sleep(0.5)

    # First, get metadata for the Fonts/Typography frame to find ALL heading text nodes
    # From earlier scans, the "Fonts" frame is at 1:1766
    payload = {
        "jsonrpc": "2.0",
        "id": 200,
        "method": "tools/call",
        "params": {
            "name": "get_metadata",
            "arguments": {"fileKey": "bVRNvc1roScaoHUlBABt9T", "nodeId": "1:1766"}
        }
    }
    response_events[200] = threading.Event()
    send_post(payload)
    response_events[200].wait(timeout=15)

    result = responses.get(200, {})
    print("===== METADATA for Fonts frame (1:1766) =====")
    if "result" in result and "content" in result["result"]:
        content = result["result"]["content"]
        if isinstance(content, list):
            for item in content:
                if isinstance(item, dict) and "text" in item:
                    print(item["text"])
        else:
            print(str(content))
    else:
        print(json.dumps(result, indent=2))

if __name__ == "__main__":
    query_typography_section()
