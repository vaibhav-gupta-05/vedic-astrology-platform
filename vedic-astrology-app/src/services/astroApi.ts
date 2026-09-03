import { KundaliChart, PlanetPosition, HouseCusp } from '../types/astro';

/**
 * Mock service to fetch astronomical data.
 * In a real-world scenario, this would call DivineAPI, AstrologyAPI, or a Swiss Ephemeris microservice.
 */
export class AstroApiService {
  /**
   * Fetches the Kundali chart for a given date, time, and location.
   */
  static async fetchChart(dateStr: string, timeStr: string, lat: number, lon: number): Promise<KundaliChart> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock data: A chart that has Gaja Kesari Yoga (Jupiter in Kendra from Ascendant or Moon)
    // Let's put Ascendant in Aries, Jupiter in Cancer (4th house - Kendra), Moon in Libra (7th house - Kendra)
    
    return {
      ascendant: { houseNumber: 1, sign: 'Aries', degree: 15 },
      houses: {
        1: { houseNumber: 1, sign: 'Aries', degree: 15 },
        2: { houseNumber: 2, sign: 'Taurus', degree: 15 },
        3: { houseNumber: 3, sign: 'Gemini', degree: 15 },
        4: { houseNumber: 4, sign: 'Cancer', degree: 15 },
        5: { houseNumber: 5, sign: 'Leo', degree: 15 },
        6: { houseNumber: 6, sign: 'Virgo', degree: 15 },
        7: { houseNumber: 7, sign: 'Libra', degree: 15 },
        8: { houseNumber: 8, sign: 'Scorpio', degree: 15 },
        9: { houseNumber: 9, sign: 'Sagittarius', degree: 15 },
        10: { houseNumber: 10, sign: 'Capricorn', degree: 15 },
        11: { houseNumber: 11, sign: 'Aquarius', degree: 15 },
        12: { houseNumber: 12, sign: 'Pisces', degree: 15 },
      },
      planets: {
        Sun: { name: 'Sun', sign: 'Aries', degree: 10, house: 1, isRetrograde: false, nakshatra: 'Ashwini' },
        Moon: { name: 'Moon', sign: 'Libra', degree: 20, house: 7, isRetrograde: false, nakshatra: 'Vishakha' },
        Mars: { name: 'Mars', sign: 'Taurus', degree: 5, house: 2, isRetrograde: false, nakshatra: 'Krittika' },
        Mercury: { name: 'Mercury', sign: 'Pisces', degree: 25, house: 12, isRetrograde: true, nakshatra: 'Revati' },
        Jupiter: { name: 'Jupiter', sign: 'Cancer', degree: 10, house: 4, isRetrograde: false, nakshatra: 'Pushya' }, // Exalted in Kendra
        Venus: { name: 'Venus', sign: 'Taurus', degree: 15, house: 2, isRetrograde: false, nakshatra: 'Rohini' },
        Saturn: { name: 'Saturn', sign: 'Aquarius', degree: 12, house: 11, isRetrograde: false, nakshatra: 'Shatabhisha' },
        Rahu: { name: 'Rahu', sign: 'Gemini', degree: 5, house: 3, isRetrograde: true, nakshatra: 'Mrigashira' },
        Ketu: { name: 'Ketu', sign: 'Sagittarius', degree: 5, house: 9, isRetrograde: true, nakshatra: 'Mula' },
      }
    };
  }
}
