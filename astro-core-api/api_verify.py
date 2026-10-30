import requests
res = requests.post('http://127.0.0.1:8000/api/evaluate', json={
    'birth_data': {'year':2004,'month':12,'day':5,'hour':6.5,'lat':28.6,'lon':77.2},
    'rules': []
})
data = res.json()
print('Status:', res.status_code)
print('Top-level keys:', list(data.keys()))
print('SAV total:', data.get('ashtakavarga', {}).get('sav_total'))
print('AK planet:', data.get('karkamsha', {}).get('atmakaraka_planet'))
print('Karkamsha sign:', data.get('karkamsha', {}).get('karkamsha_sign'))
print('Sun nak:', data.get('grah_sthiti', {}).get('Sun', {}).get('nakshatra'))
print('Rahu retrograde in chart:', data.get('chart', {}).get('planets', {}).get('Rahu', {}).get('isRetrograde'))
print('Ketu retrograde in chart:', data.get('chart', {}).get('planets', {}).get('Ketu', {}).get('isRetrograde'))
