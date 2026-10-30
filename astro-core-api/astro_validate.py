from astro_engine import calculate_extended_data

result = calculate_extended_data(2004, 12, 5, 6.5, 28.6, 77.2)

print('=== ASHTAKAVARGA VALIDATION ===')
bav = result['ashtakavarga']['bav']
expected = {'Sun': 48, 'Moon': 49, 'Mars': 39, 'Mercury': 54, 'Jupiter': 56, 'Venus': 52, 'Saturn': 39}
all_ok = True
for planet, scores in bav.items():
    total = sum(scores)
    ok = total == expected[planet]
    if not ok:
        all_ok = False
    print(f'{planet}: {scores} | Total={total} (exp={expected[planet]}) {"OK" if ok else "FAIL!"}')

sav = result['ashtakavarga']['sav']
sav_total = result['ashtakavarga']['sav_total']
sav_ok = sav_total == 337
if not sav_ok:
    all_ok = False
print()
print(f'SAV: {sav}')
print(f'SAV Total: {sav_total} (expected 337) {"OK" if sav_ok else "FAIL!"}')

print()
if all_ok:
    print('ALL ASHTAKAVARGA VALIDATIONS PASSED')
else:
    print('SOME VALIDATIONS FAILED — check above')

print()
print('=== KARKAMSHA VALIDATION ===')
for k in result['karkamsha']['karakas']:
    print(f'{k["abbreviation"]} - {k["karaka"]}: {k["planet"]} ({k["degree"]} deg in {k["sign"]})')
print(f'Karkamsha Lagna: {result["karkamsha"]["karkamsha_sign"]}')

print()
print('=== GRAH STHITI SAMPLE ===')
for name, p in result['grah_sthiti'].items():
    print(f'{name}: {p["sign"]} {p["degree"]}° | Nak: {p["nakshatra"]} ({p["nakshatra_lord"]}) Pada {p["nakshatra_pada"]} | Retro: {p["isRetrograde"]}')
