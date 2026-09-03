import swisseph as swe
from datetime import datetime

# Set sidereal mode to Lahiri Ayanamsha (Standard in Vedic Astrology)
swe.set_sid_mode(swe.SIDM_LAHIRI)

ZODIAC_SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
]

def calculate_chart(year: int, month: int, day: int, hour: float, lat: float, lon: float):
    # Convert to julian day (UTC)
    jd = swe.julday(year, month, day, hour)
    
    planets_map = {
        'Sun': swe.SUN,
        'Moon': swe.MOON,
        'Mars': swe.MARS,
        'Mercury': swe.MERCURY,
        'Jupiter': swe.JUPITER,
        'Venus': swe.VENUS,
        'Saturn': swe.SATURN,
        'Rahu': swe.MEAN_NODE,
    }
    
    chart_planets = {}
    flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL

    for name, swe_id in planets_map.items():
        res, ret_flag = swe.calc_ut(jd, swe_id, flags)
        longitude = res[0]
        sign_idx = int(longitude / 30)
        
        chart_planets[name] = {
            'name': name,
            'sign': ZODIAC_SIGNS[sign_idx],
            'degree': round(longitude % 30, 4),
            'isRetrograde': res[3] < 0
        }
        
    # Calculate Ascendant
    cusps, ascmc = swe.houses_ex(jd, lat, lon, b'P', flags)
    asc_long = ascmc[0]
    asc_sign_idx = int(asc_long / 30)
    
    # Map planets to houses based on whole sign house system (common in Vedic)
    for name, p in chart_planets.items():
        p_sign_idx = ZODIAC_SIGNS.index(p['sign'])
        house = (p_sign_idx - asc_sign_idx + 12) % 12 + 1
        p['house'] = house
        
    # Add Ketu exactly opposite to Rahu
    rahu = chart_planets['Rahu']
    ketu_sign_idx = (ZODIAC_SIGNS.index(rahu['sign']) + 6) % 12
    chart_planets['Ketu'] = {
        'name': 'Ketu',
        'sign': ZODIAC_SIGNS[ketu_sign_idx],
        'degree': rahu['degree'],
        'house': (rahu['house'] + 6 - 1) % 12 + 1,
        'isRetrograde': rahu['isRetrograde']
    }
    
    return {
        'ascendant': {
            'sign': ZODIAC_SIGNS[asc_sign_idx],
            'degree': round(asc_long % 30, 4)
        },
        'planets': chart_planets
    }

def evaluate_condition(chart: dict, condition: dict) -> bool:
    entity = condition.get('entity')
    operator = condition.get('operator')
    value = condition.get('value')
    
    planet = chart['planets'].get(entity)
    if not planet:
        return False
        
    if operator == 'IN_HOUSE':
        if str(value).upper() == 'KENDRA':
            return planet['house'] in [1, 4, 7, 10]
        if str(value).upper() == 'TRIKONA':
            return planet['house'] in [1, 5, 9]
        return planet['house'] == int(value)
        
    if operator == 'IN_SIGN':
        return planet['sign'].upper() == str(value).upper()
        
    if operator == 'EXALTED':
        exaltations = {
            'Sun': 'Aries', 'Moon': 'Taurus', 'Mars': 'Capricorn', 'Mercury': 'Virgo',
            'Jupiter': 'Cancer', 'Venus': 'Pisces', 'Saturn': 'Libra', 'Rahu': 'Taurus', 'Ketu': 'Scorpio'
        }
        return planet['sign'] == exaltations.get(entity)
        
    if operator == 'DEBILITATED':
        debilitations = {
            'Sun': 'Libra', 'Moon': 'Scorpio', 'Mars': 'Cancer', 'Mercury': 'Pisces',
            'Jupiter': 'Capricorn', 'Venus': 'Virgo', 'Saturn': 'Aries', 'Rahu': 'Scorpio', 'Ketu': 'Taurus'
        }
        return planet['sign'] == debilitations.get(entity)
        
    if operator == 'CONJUNCT':
        target = chart['planets'].get(value)
        if not target: return False
        return planet['house'] == target['house']
        
    if operator == 'ASPECTS':
        target = chart['planets'].get(value)
        if not target: return False
        rel_house = (target['house'] - planet['house'] + 12) % 12 + 1
        if rel_house == 7: return True
        if entity == 'Mars' and rel_house in [4, 8]: return True
        if entity == 'Jupiter' and rel_house in [5, 9]: return True
        if entity == 'Saturn' and rel_house in [3, 10]: return True
        return False
        
    return False

def evaluate_rules(chart: dict, rules: list) -> list:
    matched = []
    for rule in rules:
        results = [evaluate_condition(chart, cond) for cond in rule.get('conditions', [])]
        if not results:
            continue
        is_match = all(results) if rule.get('logic', 'AND') == 'AND' else any(results)
        if is_match:
            matched.append(rule)
    return matched
