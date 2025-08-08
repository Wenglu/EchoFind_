import requests

url = "https://shazam.p.rapidapi.com/charts/track"

querystring = {
    "locale": "en-US",
    "pageSize": "10",
    "startFrom": "0"
}

headers = {
    "x-rapidapi-key": "f9ae0566ccmshf176f9c67f64b85p1958f1jsnb919bef90bf7",
    "x-rapidapi-host": "shazam.p.rapidapi.com"
}

response = requests.get(url, headers=headers, params=querystring)

print("Status:", response.status_code)
print("Content:", response.text)  # ← żeby zobaczyć dokładnie co przychodzi

try:
    data = response.json()
    for i, track in enumerate(data['tracks'], start=1):
        print(f"{i}. {track['subtitle']} – \"{track['title']}\"")
except Exception as e:
    print("❌ JSON Decode Error:", e)
