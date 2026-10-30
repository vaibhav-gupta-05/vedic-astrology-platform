import unittest
from astro_engine import calculate_chart, calculate_extended_data, evaluate_condition, evaluate_rules, ZODIAC_SIGNS

def test_full_astronomical_calculations():
    # Test valid birth data
    chart = calculate_chart(2004, 12, 5, 6.5, 28.6, 77.2)
    extended = calculate_extended_data(2004, 12, 5, 6.5, 28.6, 77.2)

    # 1. Chart keys
    assert 'ascendant' in chart
    assert 'planets' in chart
    assert len(chart['planets']) == 9  # 7 planets + Rahu + Ketu

    # 2. Ascendant sign and degree
    assert chart['ascendant']['sign'] in ZODIAC_SIGNS
    assert 0 <= chart['ascendant']['degree'] < 30

    # 3. Ketu is exactly 180 degrees opposite Rahu (6 houses away)
    rahu_house = chart['planets']['Rahu']['house']
    ketu_house = chart['planets']['Ketu']['house']
    assert (rahu_house + 6 - 1) % 12 + 1 == ketu_house

    # 4. Ashtakavarga SAV total must be exactly 337
    assert extended['ashtakavarga']['sav_total'] == 337
    assert sum(extended['ashtakavarga']['sav']) == 337

    # 5. Jaimini Karakas - Exactly 7 planets, Atmakaraka has highest degree
    karakas = extended['karkamsha']['karakas']
    assert len(karakas) == 7
    assert karakas[0]['abbreviation'] == 'AK'
    assert karakas[0]['planet'] == extended['karkamsha']['atmakaraka_planet']
    for i in range(len(karakas) - 1):
        assert karakas[i]['degree'] >= karakas[i+1]['degree']

    # 6. Grah Sthiti Nakshatra padas strictly within 1..4
    for planet, data in extended['grah_sthiti'].items():
        assert 1 <= data['nakshatra_pada'] <= 4
        assert data['nakshatra'] != ''
        assert data['nakshatra_lord'] != ''

    # 7. Panchang indices
    p = extended['panchang']
    assert 1 <= p['tithi'] <= 30
    assert 1 <= p['nakshatra'] <= 27
    assert 1 <= p['yoga'] <= 27
    assert 1 <= p['karana'] <= 60
    assert p['vaar'] in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

def test_edge_case_resilience():
    chart = calculate_chart(2000, 1, 1, 12.0, 0.0, 0.0)
    extended = calculate_extended_data(2000, 1, 1, 12.0, 0.0, 0.0)

    # 1. Non-existent planet entity should safely return False, never crash
    res = evaluate_condition(chart, {'entity': 'Pluto', 'operator': 'IN_HOUSE', 'value': '1'}, extended)
    assert res is False

    # 2. Non-integer house value should safely return False, never crash
    res = evaluate_condition(chart, {'entity': 'Sun', 'operator': 'IN_HOUSE', 'value': 'invalid_house'}, extended)
    assert res is False

    res = evaluate_condition(chart, {'entity': 'Sun', 'operator': 'IN_HOUSE', 'value': ''}, extended)
    assert res is False

    # 3. Non-existent entity for BAV score should safely return False
    res = evaluate_condition(chart, {'entity': 'GhostPlanet', 'operator': 'BAV_SCORE_GTE', 'value': '5'}, extended)
    assert res is False

    # 4. Non-existent entity for SAV score should safely return False
    res = evaluate_condition(chart, {'entity': 'GhostPlanet', 'operator': 'SAV_SCORE_GTE', 'value': '28'}, extended)
    assert res is False

    # 5. Invalid values for Navamsha and Chalit houses
    res = evaluate_condition(chart, {'entity': 'Moon', 'operator': 'NAVAMSHA_IN_HOUSE', 'value': 'abc'}, extended)
    assert res is False

    res = evaluate_condition(chart, {'entity': 'Mars', 'operator': 'CHALIT_IN_HOUSE', 'value': None}, extended)
    assert res is False

def test_rule_evaluation_logic():
    chart = calculate_chart(2004, 12, 5, 6.5, 28.6, 77.2)
    extended = calculate_extended_data(2004, 12, 5, 6.5, 28.6, 77.2)

    # Rule 1: Always matching rule
    rule_pass = {
        'id': 'r1',
        'name': 'SAV Total Check',
        'description': 'SAV is valid',
        'logic': 'AND',
        'conditions': [
            {'entity': 'Moon', 'operator': 'IS_ATMAKARAKA', 'value': ''}
        ]
    }

    # Rule 2: Always failing rule
    rule_fail = {
        'id': 'r2',
        'name': 'Impossible Sun In House',
        'description': 'Impossible',
        'logic': 'AND',
        'conditions': [
            {'entity': 'Sun', 'operator': 'IN_HOUSE', 'value': '99'}
        ]
    }

    # Test AND logic
    matched = evaluate_rules(chart, [rule_pass, rule_fail], extended)
    assert len(matched) == 1
    assert matched[0]['id'] == 'r1'

    # Test OR logic on rule with one failing and one passing condition
    rule_or = {
        'id': 'r3',
        'name': 'OR rule',
        'description': 'OR logic test',
        'logic': 'OR',
        'conditions': [
            {'entity': 'Sun', 'operator': 'IN_HOUSE', 'value': '99'},  # False
            {'entity': 'Moon', 'operator': 'IS_ATMAKARAKA', 'value': ''}  # True
        ]
    }
    matched_or = evaluate_rules(chart, [rule_or], extended)
    assert len(matched_or) == 1
    assert matched_or[0]['id'] == 'r3'

if __name__ == '__main__':
    print("Running test_full_astronomical_calculations()...")
    test_full_astronomical_calculations()
    print("PASS: test_full_astronomical_calculations")
    
    print("Running test_edge_case_resilience()...")
    test_edge_case_resilience()
    print("PASS: test_edge_case_resilience")
    
    print("Running test_rule_evaluation_logic()...")
    test_rule_evaluation_logic()
    print("PASS: test_rule_evaluation_logic")
    
    print("\nALL GRAVITAS VERIFICATION TESTS PASSED SUCCESSFULLY!")
