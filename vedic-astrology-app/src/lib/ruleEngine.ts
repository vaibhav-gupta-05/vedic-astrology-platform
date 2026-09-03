import { KundaliChart, AstroRule, RuleCondition, Planet } from '../types/astro';

/**
 * The Deterministic Rule Engine.
 * Evaluates astrological rules against a provided Kundali chart.
 */
export class RuleEngine {
  
  /**
   * Evaluates an array of rules against the chart and returns the matching rules.
   */
  static evaluateRules(chart: KundaliChart, rules: AstroRule[]): AstroRule[] {
    const matchedRules: AstroRule[] = [];

    for (const rule of rules) {
      const conditionResults = rule.conditions.map(cond => this.evaluateCondition(chart, cond));
      
      const isMatch = rule.logic === 'AND' 
        ? conditionResults.every(res => res === true)
        : conditionResults.some(res => res === true);

      if (isMatch && rule.conditions.length > 0) {
        matchedRules.push(rule);
      }
    }

    return matchedRules;
  }

  private static evaluateCondition(chart: KundaliChart, condition: RuleCondition): boolean {
    const { entity, operator, value } = condition;
    
    // Check if the entity is a specific Planet
    const planet = chart.planets[entity as Planet];

    if (!planet) {
      console.warn(`Entity ${entity} not found or not supported yet.`);
      return false; // Could be extended to support Lords, etc. e.g. "LordOf(1)"
    }

    switch (operator) {
      case 'IN_HOUSE':
        // Handle explicit house numbers, e.g., '4', or special keywords like 'KENDRA'
        if (value.toUpperCase() === 'KENDRA') {
          return [1, 4, 7, 10].includes(planet.house);
        }
        if (value.toUpperCase() === 'TRIKONA') {
          return [1, 5, 9].includes(planet.house);
        }
        return planet.house === parseInt(value, 10);
        
      case 'IN_SIGN':
        return planet.sign === value;

      case 'CONJUNCT':
        // Conjunction happens if both planets are in the same house
        const targetPlanet = chart.planets[value as Planet];
        if (!targetPlanet) return false;
        return planet.house === targetPlanet.house;

      case 'ASPECTS':
        // Vedic Aspects are specific to planets. 
        // All planets aspect the 7th house from their position.
        // Mars aspects 4th, 7th, 8th. Jupiter aspects 5th, 7th, 9th. Saturn aspects 3rd, 7th, 10th.
        const aspectedPlanet = chart.planets[value as Planet];
        if (!aspectedPlanet) return false;
        
        const relativeHousePosition = (aspectedPlanet.house - planet.house + 12) % 12 + 1;
        
        if (relativeHousePosition === 7) return true;
        if (planet.name === 'Mars' && [4, 8].includes(relativeHousePosition)) return true;
        if (planet.name === 'Jupiter' && [5, 9].includes(relativeHousePosition)) return true;
        if (planet.name === 'Saturn' && [3, 10].includes(relativeHousePosition)) return true;
        return false;

      case 'EXALTED':
        // Simplified exaltation logic
        const exaltationSigns: Record<Planet, string> = {
          Sun: 'Aries', Moon: 'Taurus', Mars: 'Capricorn', Mercury: 'Virgo', 
          Jupiter: 'Cancer', Venus: 'Pisces', Saturn: 'Libra', Rahu: 'Taurus', Ketu: 'Scorpio'
        };
        return planet.sign === exaltationSigns[planet.name];

      case 'DEBILITATED':
        const debilitationSigns: Record<Planet, string> = {
          Sun: 'Libra', Moon: 'Scorpio', Mars: 'Cancer', Mercury: 'Pisces', 
          Jupiter: 'Capricorn', Venus: 'Virgo', Saturn: 'Aries', Rahu: 'Scorpio', Ketu: 'Taurus'
        };
        return planet.sign === debilitationSigns[planet.name];

      default:
        return false;
    }
  }
}
