import swisseph as swe
from datetime import datetime

# Set sidereal mode to Lahiri Ayanamsha (Standard in Vedic Astrology)
swe.set_sid_mode(swe.SIDM_LAHIRI)

ZODIAC_SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
]

def calculate_chart(year: int, month: int, day: int, hour: float, lat: float, lon: float):
    # Ensure Lahiri is set in this thread (Starlette threadpool resets C-extension state)
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    
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
            # Rahu/Ketu are always considered retrograde in Vedic tradition
            'isRetrograde': True if name == 'Rahu' else res[3] < 0
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
        'isRetrograde': True  # Ketu is always retrograde in Vedic tradition
    }
    
    return {
        'ascendant': {
            'sign': ZODIAC_SIGNS[asc_sign_idx],
            'degree': round(asc_long % 30, 4)
        },
        'planets': chart_planets
    }

def evaluate_condition(chart: dict, condition: dict, extended_data: dict = None) -> bool:
    entity = condition.get('entity')
    operator = condition.get('operator')
    value = condition.get('value')

    # =========================================================================
    # Phase 2B extended operators — Grah Sthiti, Ashtakavarga, Karkamsha
    # These require extended_data; fall back gracefully if not provided.
    # =========================================================================

    if operator == 'IN_NAKSHATRA':
        if not extended_data:
            return False
        grah = extended_data.get('grah_sthiti', {}).get(entity)
        if not grah:
            return False
        target_nak = str(value).strip().upper()
        if target_nak.isdigit():
            nak_num = int(target_nak)
            if 1 <= nak_num <= 27:
                target_nak = NAKSHATRA_NAMES[nak_num - 1].upper()
        return grah['nakshatra'].upper() == target_nak

    if operator == 'NAKSHATRA_LORD_IS':
        if not extended_data:
            return False
        grah = extended_data.get('grah_sthiti', {}).get(entity)
        if not grah:
            return False
        return grah['nakshatra_lord'].upper() == str(value).upper()

    if operator in ('BAV_SCORE_GTE', 'BAV_SCORE_LTE'):
        if not extended_data:
            return False
        # entity = planet (Sun/Moon/Mars/Mercury/Jupiter/Venus/Saturn)
        # value = "N" where N is the bindu threshold
        bav = extended_data.get('ashtakavarga', {}).get('bav', {})
        planet_bav = bav.get(entity)
        if not planet_bav:
            return False
        # Get the BAV score for the planet's own natal house (whole-sign)
        p_info = chart.get('planets', {}).get(entity)
        if not p_info or 'sign' not in p_info or p_info['sign'] not in ZODIAC_SIGNS:
            return False
        planet_sign_idx = ZODIAC_SIGNS.index(p_info['sign'])
        try:
            score = planet_bav[planet_sign_idx]
            threshold = int(value)
        except (TypeError, ValueError, IndexError):
            return False
        if operator == 'BAV_SCORE_GTE':
            return score >= threshold
        else:
            return score <= threshold

    if operator == 'SAV_SCORE_GTE':
        if not extended_data:
            return False
        # entity = zodiac sign name or house number; value = threshold
        sav = extended_data.get('ashtakavarga', {}).get('sav', [])
        # entity here is the planet whose house we look up
        p = chart.get('planets', {}).get(entity)
        if not p or 'sign' not in p or p['sign'] not in ZODIAC_SIGNS:
            return False
        sign_idx = ZODIAC_SIGNS.index(p['sign'])
        try:
            return sav[sign_idx] >= int(value)
        except (ValueError, IndexError):
            return False

    if operator == 'IS_ATMAKARAKA':
        if not extended_data:
            return False
        return extended_data.get('karkamsha', {}).get('atmakaraka_planet') == entity

    if operator == 'IS_KARAKA':
        # entity = planet, value = karaka abbreviation e.g. 'AK', 'AmK', 'BK', 'MK', 'PK', 'GK', 'DK'
        if not extended_data:
            return False
        karakas = extended_data.get('karkamsha', {}).get('karakas', [])
        for k in karakas:
            if k['planet'] == entity and k['abbreviation'].upper() == str(value).upper():
                return True
        return False

    if operator == 'KARKAMSHA_IN_SIGN':
        # entity is ignored; value = sign name or number 1-12
        if not extended_data:
            return False
        ks = extended_data.get('karkamsha', {}).get('karkamsha_sign', '')
        target_sign = str(value).strip().upper()
        if target_sign.isdigit():
            sign_num = int(target_sign)
            if 1 <= sign_num <= 12:
                target_sign = ZODIAC_SIGNS[sign_num - 1].upper()
        return ks.upper() == target_sign

    # =========================================================================
    # Navamsha D9, Bhava Chalit, and Panchang operators
    # =========================================================================

    if operator == 'NAVAMSHA_IN_SIGN':
        if not extended_data: return False
        np = extended_data.get('navamsha_chart', {}).get('planets', {}).get(entity)
        if not np: return False
        target_sign = str(value).strip().upper()
        if target_sign.isdigit():
            sign_num = int(target_sign)
            if 1 <= sign_num <= 12:
                target_sign = ZODIAC_SIGNS[sign_num - 1].upper()
        return np['sign'].upper() == target_sign

    if operator == 'NAVAMSHA_IN_HOUSE':
        if not extended_data: return False
        np = extended_data.get('navamsha_chart', {}).get('planets', {}).get(entity)
        if not np: return False
        if str(value).upper() == 'KENDRA': return np['house'] in [1, 4, 7, 10]
        if str(value).upper() == 'TRIKONA': return np['house'] in [1, 5, 9]
        try:
            return np['house'] == int(value)
        except (ValueError, TypeError):
            return False

    if operator == 'CHALIT_IN_HOUSE':
        if not extended_data: return False
        cp = extended_data.get('chalit_chart', {}).get('planets', {}).get(entity)
        if not cp: return False
        if str(value).upper() == 'KENDRA': return cp['house'] in [1, 4, 7, 10]
        if str(value).upper() == 'TRIKONA': return cp['house'] in [1, 5, 9]
        try:
            return cp['house'] == int(value)
        except (ValueError, TypeError):
            return False

    if operator == 'VAAR_IS':
        if not extended_data: return False
        return extended_data.get('panchang', {}).get('vaar', '').upper() == str(value).upper()

    if operator == 'TITHI_IS':
        if not extended_data: return False
        tithi_val = extended_data.get('panchang', {}).get('tithi', 0)
        try:
            return tithi_val == int(value)
        except (ValueError, TypeError):
            # check common names e.g. Purnima=15, Amavasya=30
            name_map = {'PURNIMA': 15, 'AMAVASYA': 30}
            return tithi_val == name_map.get(str(value).upper(), -1)

    # =========================================================================
    # Original Phase 1 operators — DO NOT MODIFY
    # =========================================================================
    planet = chart['planets'].get(entity)
    if not planet:
        return False
        
    if operator == 'IN_HOUSE':
        if str(value).upper() == 'KENDRA':
            return planet['house'] in [1, 4, 7, 10]
        if str(value).upper() == 'TRIKONA':
            return planet['house'] in [1, 5, 9]
        try:
            return planet['house'] == int(value)
        except (ValueError, TypeError):
            return False
        
    if operator == 'IN_SIGN':
        target_sign = str(value).strip().upper()
        if target_sign.isdigit():
            sign_num = int(target_sign)
            if 1 <= sign_num <= 12:
                target_sign = ZODIAC_SIGNS[sign_num - 1].upper()
        return planet['sign'].upper() == target_sign
        
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

def evaluate_rules(chart: dict, rules: list, extended_data: dict = None) -> list:
    matched = []
    for rule in rules:
        results = [evaluate_condition(chart, cond, extended_data) for cond in rule.get('conditions', [])]
        if not results:
            continue
        is_match = all(results) if rule.get('logic', 'AND') == 'AND' else any(results)
        if is_match:
            matched.append(rule)
    return matched

# =============================================================================
# PHASE 2A + 2B: EXTENDED CHARTS
# =============================================================================

NAKSHATRA_NAMES = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta',
    'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
]

NAKSHATRA_LORDS = [
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
    'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun',
    'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
    'Jupiter', 'Saturn', 'Mercury'
]

def get_nakshatra(longitude: float) -> dict:
    """Returns Nakshatra name, lord, and pada (quarter) for a given sidereal longitude."""
    nak_idx = int(longitude / (360 / 27))
    pada = int((longitude % (360 / 27)) / (360 / 108)) + 1
    pada = max(1, min(4, pada))
    return {
        'name': NAKSHATRA_NAMES[nak_idx % 27],
        'lord': NAKSHATRA_LORDS[nak_idx % 27],
        'pada': pada
    }

# Ashtakavarga benefic offset tables from BPHS (Parashari system — matching AstroSage)
ASHTAK_RULES = {
    'Sun': {
        'Sun':     [1, 2, 4, 7, 8, 9, 10, 11],     # 8 bindus
        'Moon':    [3, 6, 10, 11],                   # 4 bindus
        'Mars':    [1, 2, 4, 7, 8, 9, 10, 11],     # 8 bindus
        'Mercury': [3, 5, 6, 9, 10, 11, 12],        # 7 bindus (BPHS corrected)
        'Jupiter': [5, 6, 9, 11],                   # 4 bindus
        'Venus':   [6, 7, 12],                      # 3 bindus
        'Saturn':  [1, 2, 4, 7, 8, 9, 10, 11],     # 8 bindus
        'Lagna':   [3, 4, 6, 10, 11, 12],           # 6 bindus → Total=48
    },
    'Moon': {
        'Sun':     [3, 6, 7, 8, 10, 11],            # 6 bindus
        'Moon':    [1, 3, 6, 7, 10, 11],            # 6 bindus (BPHS: adds 7)
        'Mars':    [2, 3, 5, 6, 9, 10, 11],         # 7 bindus
        'Mercury': [1, 3, 4, 5, 7, 8, 10, 11],     # 8 bindus
        'Jupiter': [1, 4, 7, 8, 10, 11, 12],        # 7 bindus
        'Venus':   [3, 4, 5, 7, 9, 10, 11],         # 7 bindus (BPHS: adds 11)
        'Saturn':  [3, 5, 6, 11],                   # 4 bindus
        'Lagna':   [3, 6, 10, 11],                  # 4 bindus → Total=49
    },
    'Mars': {
        'Sun':     [3, 5, 6, 10, 11],
        'Moon':    [3, 6, 11],
        'Mars':    [1, 2, 4, 7, 8, 9, 10, 11],
        'Mercury': [3, 5, 6, 11],
        'Jupiter': [6, 10, 11, 12],
        'Venus':   [6, 11, 12],
        'Saturn':  [1, 4, 7, 8, 9, 10, 11],
        'Lagna':   [1, 3, 6, 10, 11],
    },
    'Mercury': {
        'Sun':     [5, 6, 9, 11, 12],
        'Moon':    [2, 4, 6, 8, 10, 11],
        'Mars':    [1, 2, 4, 7, 8, 9, 10, 11],
        'Mercury': [1, 3, 5, 6, 9, 10, 11, 12],
        'Jupiter': [6, 8, 11, 12],
        'Venus':   [1, 2, 3, 4, 5, 8, 9, 11],
        'Saturn':  [1, 2, 4, 7, 8, 9, 10, 11],
        'Lagna':   [1, 2, 4, 6, 8, 10, 11],
    },
    'Jupiter': {
        'Sun':     [1, 2, 3, 4, 7, 8, 9, 10, 11], # 9 bindus
        'Moon':    [2, 5, 7, 9, 11],               # 5 bindus
        'Mars':    [1, 2, 4, 7, 8, 10, 11],        # 7 bindus
        'Mercury': [1, 2, 4, 5, 6, 9, 10, 11],     # 8 bindus
        'Jupiter': [1, 2, 3, 4, 7, 8, 10, 11],     # 8 bindus
        'Venus':   [2, 5, 6, 9, 10, 11],           # 6 bindus
        'Saturn':  [3, 5, 6, 12],                   # 4 bindus
        'Lagna':   [1, 2, 4, 5, 6, 7, 9, 10, 11], # 9 bindus → Total=56
    },
    'Venus': {
        'Sun':     [8, 11, 12],
        'Moon':    [1, 2, 3, 4, 5, 8, 9, 11, 12],
        'Mars':    [3, 5, 6, 9, 11, 12],
        'Mercury': [3, 5, 6, 9, 11],
        'Jupiter': [5, 8, 9, 10, 11],
        'Venus':   [1, 2, 3, 4, 5, 8, 9, 10, 11],
        'Saturn':  [3, 4, 5, 8, 9, 10, 11],
        'Lagna':   [1, 2, 3, 4, 5, 8, 9, 11],
    },
    'Saturn': {
        'Sun':     [1, 2, 4, 7, 8, 10, 11],
        'Moon':    [3, 6, 11],
        'Mars':    [3, 5, 6, 10, 11, 12],
        'Mercury': [6, 8, 9, 10, 11, 12],
        'Jupiter': [5, 6, 11, 12],
        'Venus':   [6, 11, 12],
        'Saturn':  [3, 5, 6, 11],
        'Lagna':   [1, 3, 4, 6, 10, 11],
    },
}

BAV_EXPECTED_TOTALS = {
    'Sun': 48, 'Moon': 49, 'Mars': 39, 'Mercury': 54,
    'Jupiter': 56, 'Venus': 52, 'Saturn': 39
}


def calculate_extended_data(year: int, month: int, day: int, hour: float, lat: float, lon: float):
    # Ensure Lahiri is set in this thread
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    
    jd = swe.julday(year, month, day, hour)
    flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL

    # Get exact sidereal longitudes for all planets
    planets_map = {
        'Sun': swe.SUN, 'Moon': swe.MOON, 'Mars': swe.MARS, 'Mercury': swe.MERCURY,
        'Jupiter': swe.JUPITER, 'Venus': swe.VENUS, 'Saturn': swe.SATURN, 'Rahu': swe.MEAN_NODE
    }
    
    longitudes = {}
    retrograde = {}
    for name, swe_id in planets_map.items():
        res, _ = swe.calc_ut(jd, swe_id, flags)
        longitudes[name] = res[0]
        retrograde[name] = True if name == 'Rahu' else res[3] < 0

    longitudes['Ketu'] = (longitudes['Rahu'] + 180) % 360
    retrograde['Ketu'] = True  # Always retrograde in Vedic tradition

    # House cusps — use Porphyry ('O') for Sri Pati Chalit boundaries
    cusps, ascmc = swe.houses_ex(jd, lat, lon, b'O', flags)
    asc_long = ascmc[0]
    asc_sign_idx = int(asc_long / 30)

    # =========================================================================
    # CHALIT CHART (Sri Pati — Porphyry midpoints as Bhava Sandhis)
    # =========================================================================
    def get_chalit_house(plon, cusps_tuple):
        n = len(cusps_tuple)
        start_idx = 1 if n == 13 else 0
        
        starts = []
        for i in range(12):
            c1_idx = start_idx + ((i - 1) % 12)
            c2_idx = start_idx + i
            c1 = cusps_tuple[c1_idx]
            c2 = cusps_tuple[c2_idx]
            if c2 < c1:
                c2 += 360
            start = (c1 + c2) / 2.0
            starts.append(start % 360)
            
        for i in range(12):
            s1 = starts[i]
            s2 = starts[(i + 1) % 12]
            if s1 <= s2:
                if s1 <= plon < s2:
                    return i + 1
            else:
                if plon >= s1 or plon < s2:
                    return i + 1
        return 1

    chalit_planets = {}
    for name, lon_val in longitudes.items():
        sign_idx = int(lon_val / 30)
        house = get_chalit_house(lon_val, cusps)
        chalit_planets[name] = {
            'name': name,
            'sign': ZODIAC_SIGNS[sign_idx],
            'degree': round(lon_val % 30, 4),
            'house': house,
            'isRetrograde': retrograde[name]
        }
        
    chalit_chart = {
        'ascendant': {
            'sign': ZODIAC_SIGNS[asc_sign_idx],
            'degree': round(asc_long % 30, 4)
        },
        'planets': chalit_planets
    }

    # =========================================================================
    # NAVAMSHA CHART (D9)
    # =========================================================================
    navamsha_planets = {}
    asc_d9_idx = int((asc_long * 9) / 30) % 12
    for name, lon_val in longitudes.items():
        d9_idx = int((lon_val * 9) / 30) % 12
        house = (d9_idx - asc_d9_idx + 12) % 12 + 1
        navamsha_planets[name] = {
            'name': name,
            'sign': ZODIAC_SIGNS[d9_idx],
            'degree': round((lon_val % (30 / 9)) * 9, 4),
            'house': house,
            'isRetrograde': retrograde[name]
        }
        
    navamsha_chart = {
        'ascendant': {
            'sign': ZODIAC_SIGNS[asc_d9_idx],
            'degree': round((asc_long % (30 / 9)) * 9, 4)
        },
        'planets': navamsha_planets
    }

    # =========================================================================
    # PANCHANG
    # =========================================================================
    sun_lon = longitudes['Sun']
    moon_lon = longitudes['Moon']
    
    diff = (moon_lon - sun_lon) % 360
    tithi_idx = int(diff / 12) + 1
    if tithi_idx > 30: tithi_idx = 30  # Guard: edge case at exact New Moon

    nak_idx = int(moon_lon / (360 / 27)) + 1
    if nak_idx > 27: nak_idx = 27
    yoga_idx = int((sun_lon + moon_lon) % 360 / (360 / 27)) + 1
    if yoga_idx > 27: yoga_idx = 27
    karana_idx = int(diff / 6) + 1
    if karana_idx > 60: karana_idx = 60
    
    try:
        dt = datetime(int(year), int(month), int(day))
        vaar_idx = dt.weekday()  # Python: 0=Monday
    except (ValueError, TypeError):
        vaar_idx = 0
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    panchang = {
        "tithi": tithi_idx,
        "nakshatra": nak_idx,
        "yoga": yoga_idx,
        "karana": karana_idx,
        "vaar": days[vaar_idx]
    }

    # =========================================================================
    # GRAH STHITI — Enriched planet table with Nakshatra data
    # =========================================================================
    grah_sthiti = {}
    for name, lon_val in longitudes.items():
        nak_data = get_nakshatra(lon_val)
        sign_idx = int(lon_val / 30)
        grah_sthiti[name] = {
            'name': name,
            'sign': ZODIAC_SIGNS[sign_idx],
            'degree': round(lon_val % 30, 4),
            'absolute_longitude': round(lon_val, 4),
            'nakshatra': nak_data['name'],
            'nakshatra_lord': nak_data['lord'],
            'nakshatra_pada': nak_data['pada'],
            'isRetrograde': retrograde[name]
        }

    # =========================================================================
    # ASHTAKAVARGA — Phase 2B
    # Classical Parashari Bhinnashtakavarga (BAV) + Sarvashtakavarga (SAV)
    # Source: BPHS — matching AstroSage Parashari tables
    # =========================================================================
    contributor_signs = {
        'Sun':     int(longitudes['Sun'] / 30),
        'Moon':    int(longitudes['Moon'] / 30),
        'Mars':    int(longitudes['Mars'] / 30),
        'Mercury': int(longitudes['Mercury'] / 30),
        'Jupiter': int(longitudes['Jupiter'] / 30),
        'Venus':   int(longitudes['Venus'] / 30),
        'Saturn':  int(longitudes['Saturn'] / 30),
        'Lagna':   asc_sign_idx,
    }

    bav = {}
    for target_planet, contributors in ASHTAK_RULES.items():
        scores = [0] * 12
        for contributor, offsets in contributors.items():
            base_sign = contributor_signs[contributor]
            for offset in offsets:
                benefic_sign = (base_sign + offset - 1) % 12
                scores[benefic_sign] += 1
        bav[target_planet] = scores

        total = sum(scores)
        expected = BAV_EXPECTED_TOTALS[target_planet]
        if total != expected:
            print(f"WARNING: {target_planet} BAV total = {total}, expected {expected}")

    sav = [sum(bav[p][i] for p in bav) for i in range(12)]
    sav_total = sum(sav)
    if sav_total != 337:
        print(f"WARNING: SAV total = {sav_total}, expected 337")

    ashtakavarga = {
        'bav': bav,
        'sav': sav,
        'sav_total': sav_total,
        'bav_totals': {p: sum(scores) for p, scores in bav.items()}
    }

    # =========================================================================
    # JAIMINI CHARA KARAKAS + KARKAMSHA — Phase 2B
    # 7-planet scheme (Rahu/Ketu excluded), standard AstroSage method
    # =========================================================================
    KARAKA_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']
    KARAKA_NAMES = [
        'Atmakaraka', 'Amatyakaraka', 'Bhratrukaraka', 'Matrukaraka',
        'Putrakaraka', 'Gnatikaraka', 'Darakaraka'
    ]
    KARAKA_ABBR = ['AK', 'AmK', 'BK', 'MK', 'PK', 'GK', 'DK']

    karaka_degrees = {name: longitudes[name] % 30 for name in KARAKA_PLANETS}
    sorted_karakas = sorted(KARAKA_PLANETS, key=lambda p: karaka_degrees[p], reverse=True)

    karakas = []
    for rank, planet in enumerate(sorted_karakas):
        karakas.append({
            'rank': rank + 1,
            'karaka': KARAKA_NAMES[rank],
            'abbreviation': KARAKA_ABBR[rank],
            'planet': planet,
            'degree': round(karaka_degrees[planet], 4),
            'sign': ZODIAC_SIGNS[int(longitudes[planet] / 30)]
        })

    atmakaraka_planet = sorted_karakas[0]
    atmakaraka_lon = longitudes[atmakaraka_planet]
    karkamsha_sign_idx = int((atmakaraka_lon * 9) / 30) % 12

    karkamsha = {
        'atmakaraka_planet': atmakaraka_planet,
        'karkamsha_sign': ZODIAC_SIGNS[karkamsha_sign_idx],
        'karakas': karakas
    }

    return {
        # Phase 2A (untouched keys — same values, same structure)
        "chalit_chart": chalit_chart,
        "navamsha_chart": navamsha_chart,
        "panchang": panchang,
        # Phase 2B (new keys)
        "grah_sthiti": grah_sthiti,
        "ashtakavarga": ashtakavarga,
        "karkamsha": karkamsha,
    }
