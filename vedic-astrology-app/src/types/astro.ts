export type Planet = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu';
export type ZodiacSign = 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export interface PlanetPosition {
  name: Planet;
  sign: ZodiacSign;
  degree: number; // 0 to 360 or 0 to 30 depending on preference, let's use 0 to 30 within the sign
  house: number; // 1 to 12
  isRetrograde: boolean;
  nakshatra: string;
}

export interface HouseCusp {
  houseNumber: number; // 1 to 12
  sign: ZodiacSign;
  degree: number;
}

export interface KundaliChart {
  planets: Record<Planet, PlanetPosition>;
  houses: Record<number, HouseCusp>; // key: 1-12
  ascendant: HouseCusp; // The 1st house cusp
}

// Represents the criteria for a rule
export interface RuleCondition {
  entity: string; // e.g., 'Jupiter', 'Moon', 'LordOf(1)'
  operator: 'IN_HOUSE' | 'IN_SIGN' | 'CONJUNCT' | 'ASPECTS' | 'EXALTED' | 'DEBILITATED';
  value: string; // e.g., '4', 'Cancer', 'Moon', 'Saturn'
}

export interface AstroRule {
  id: string;
  name: string;
  description: string;
  conditions: RuleCondition[];
  logic: 'AND' | 'OR'; // Defines how conditions are combined
}
