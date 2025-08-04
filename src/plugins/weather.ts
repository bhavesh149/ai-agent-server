import axios from 'axios';
import { WeatherData, PluginResult } from '../types';
import { config } from '../config';

export class WeatherPlugin {
  async execute(location: string): Promise<PluginResult> {
    const startTime = Date.now();
    console.log(`🌤️  [TOOL CALLED] Weather Plugin - Location: ${location}`);
    
    try {
      const url = `${config.openWeatherBaseUrl}/weather`;
      const params = {
        q: location,
        appid: config.openWeatherApiKey,
        units: 'metric'
      };

      const response = await axios.get(url, { params });
      const data = response.data;

      const weatherData: WeatherData = {
        location: `${data.name}, ${data.sys.country}`,
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed
      };

      const executionTime = Date.now() - startTime;
      console.log(`✅ [TOOL SUCCESS] Weather Plugin - Execution time: ${executionTime}ms`);

      return {
        pluginName: 'weather',
        result: weatherData,
        success: true
      };
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      console.error(`❌ [TOOL ERROR] Weather Plugin - Execution time: ${executionTime}ms, Error:`, error.response?.data?.message || error.message);
      
      return {
        pluginName: 'weather',
        result: null,
        success: false,
        error: error.response?.data?.message || 'Failed to fetch weather data'
      };
    }
  }

  static detectIntent(message: string): { isWeatherQuery: boolean; location?: string } {
    const weatherKeywords = ['weather', 'temperature', 'forecast', 'climate', 'hot', 'cold', 'rain', 'sunny'];
    const lowerMessage = message.toLowerCase();
    
    const hasWeatherKeyword = weatherKeywords.some(keyword => lowerMessage.includes(keyword));
    
    if (!hasWeatherKeyword) {
      return { isWeatherQuery: false };
    }

    // Simple location extraction - look for "in [location]" or "at [location]"
    const locationPatterns = [
      /(?:in|at|for)\s+([a-zA-Z\s]+?)(?:\s|$|[,.!?])/i,
      /weather\s+(?:in|at|for)?\s*([a-zA-Z\s]+?)(?:\s|$|[,.!?])/i,
      /([a-zA-Z\s]+?)\s+weather/i
    ];

    for (const pattern of locationPatterns) {
      const match = lowerMessage.match(pattern);
      if (match && match[1]) {
        const location = match[1].trim();
        if (location.length > 1 && location.length < 50) {
          return { isWeatherQuery: true, location };
        }
      }
    }

    return { isWeatherQuery: true, location: 'London' }; // Default location
  }
}

