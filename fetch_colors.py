#!/usr/bin/env python3
"""Fetch actual color values from Figma via MCP get_design_context on color text nodes."""
import json
import urllib.request
import threading
import time

def query_nodes(nodes):
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

    req_id = 200
    for node_id in nodes:
        # Try get_metadata first (returns XML structure with names)
        payload_meta = {
            "jsonrpc": "2.0",
            "id": req_id,
            "method": "tools/call",
            "params": {
                "name": "get_metadata",
                "arguments": {"fileKey": "bVRNvc1roScaoHUlBABt9T", "nodeId": node_id}
            }
        }
        response_events[req_id] = threading.Event()
        send_post(payload_meta)
        response_events[req_id].wait(timeout=10)
        meta_result = responses.get(req_id, {})
        print(f"\n===== METADATA NODE {node_id} =====")
        if "result" in meta_result and "content" in meta_result["result"]:
            content = meta_result["result"]["content"]
            if isinstance(content, list):
                for item in content:
                    if isinstance(item, dict) and "text" in item:
                        print(item["text"][:3000])
            else:
                print(str(content)[:3000])
        req_id += 1

        # Also try get_design_context (returns CSS/code with actual color values)
        payload_ctx = {
            "jsonrpc": "2.0",
            "id": req_id,
            "method": "tools/call",
            "params": {
                "name": "get_design_context",
                "arguments": {"fileKey": "bVRNvc1roScaoHUlBABt9T", "nodeId": node_id}
            }
        }
        response_events[req_id] = threading.Event()
        send_post(payload_ctx)
        response_events[req_id].wait(timeout=10)
        ctx_result = responses.get(req_id, {})
        print(f"\n===== CONTEXT NODE {node_id} =====")
        if "result" in ctx_result and "content" in ctx_result["result"]:
            content = ctx_result["result"]["content"]
            if isinstance(content, list):
                for item in content:
                    if isinstance(item, dict) and "text" in item:
                        print(item["text"][:3000])
            else:
                print(str(content)[:3000])
        req_id += 1

# Query the Colors frame and its children (from our earlier metadata scan)
nodes = ["1:2", "1:1628", "1:1629", "1:1630", "1:1779", "1:1784", "1:1783"]
query_nodes(nodes)
