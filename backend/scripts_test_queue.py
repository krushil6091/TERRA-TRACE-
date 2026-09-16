import urllib.request, json
res = urllib.request.urlopen("http://127.0.0.1:8000/api/queue")
print("=== GET /api/queue RAW JSON ===")
print(res.read().decode())

res_geo = urllib.request.urlopen("http://127.0.0.1:8000/api/queue/geography")
print("\n=== GET /api/queue/geography RAW JSON ===")
print(res_geo.read().decode())