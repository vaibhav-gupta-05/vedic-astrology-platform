import { AstroApiService } from '../services/astroApi';
import { RuleEngine } from '../lib/ruleEngine';
import { AstroRule } from '../types/astro';

async function testEngine() {
  console.log('Fetching mock chart...');
  const chart = await AstroApiService.fetchChart('1990-01-01', '12:00', 28.6139, 77.2090);
  
  // Define a rule for Gaja Kesari Yoga: Jupiter in Kendra AND Moon in Kendra
  const gajaKesariRule: AstroRule = {
    id: 'rule-1',
    name: 'Gaja Kesari Yoga',
    description: 'Brings immense wealth, fame, and overall prosperity. Indicates a strong mind and moral character.',
    logic: 'AND',
    conditions: [
      { entity: 'Jupiter', operator: 'IN_HOUSE', value: 'KENDRA' },
      { entity: 'Moon', operator: 'IN_HOUSE', value: 'KENDRA' }
    ]
  };

  // Define a rule for Ruchaka Yoga: Mars Exalted OR Mars in own sign, AND Mars in Kendra
  const ruchakaYoga: AstroRule = {
    id: 'rule-2',
    name: 'Ruchaka Yoga',
    description: 'Makes the person brave, wealthy, and successful in military or police.',
    logic: 'AND',
    conditions: [
      { entity: 'Mars', operator: 'EXALTED', value: '' }, // In the mock, Mars is in Taurus (not exalted)
    ]
  };

  const rules = [gajaKesariRule, ruchakaYoga];

  console.log('Evaluating Rules...');
  const matchedRules = RuleEngine.evaluateRules(chart, rules);

  console.log('\n--- MATCHED RULES ---');
  matchedRules.forEach(rule => {
    console.log(`- ${rule.name}: ${rule.description}`);
  });
  console.log('---------------------\n');
}

testEngine().catch(console.error);
