import axios from 'axios';
import { BasePlugin } from './basePlugin';
import { PluginResult } from '../types';

export class WeatherPlugin extends BasePlugin {
  name = 'weather';
  description = 'Get current weather information for a location';

  async execute(query: string): Promise<PluginResult> {
    try {
      // Extract location from query
      const location = this.extractLocation(query);
      if (!location) {
        return this.createErrorResult('Could not extract location from query');
      }

      // For demonstration, we'll use a mock weather service
      // In production, you'd use a real weather API like OpenWeatherMap
      const weatherData = await this.getWeatherData(location);
      
      return this.createSuccessResult({
        location,
        weather: weatherData,
        message: `Current weather in ${location}: ${weatherData.description}, ${weatherData.temperature}°C, humidity: ${weatherData.humidity}%`
      });
    } catch (error) {
      return this.createErrorResult(`Weather lookup failed: ${error}`);
    }
  }

  private extractLocation(query: string): string | null {
    // Simple location extraction
    const patterns = [
      /weather\s+in\s+([a-zA-Z\s]+)/i,
      /([a-zA-Z\s]+)\s+weather/i,
      /forecast\s+for\s+([a-zA-Z\s]+)/i
    ];

    for (const pattern of patterns) {
      const match = query.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  private async getWeatherData(location: string): Promise<any> {
    // Mock weather data for demonstration
    // In production, replace with actual API call
    const mockWeatherData = {
      'bangalore': { description: 'Partly cloudy', temperature: 24, humidity: 65 },
      'mumbai': { description: 'Sunny', temperature: 28, humidity: 70 },
      'delhi': { description: 'Hazy', temperature: 22, humidity: 60 },
      'chennai': { description: 'Hot and humid', temperature: 32, humidity: 85 },
      'kolkata': { description: 'Overcast', temperature: 26, humidity: 75 }
    };

    const normalizedLocation = location.toLowerCase();
    
    // Check if we have mock data for this location
    for (const [city, data] of Object.entries(mockWeatherData)) {
      if (normalizedLocation.includes(city)) {
        return data;
      }
    }

    // If using real API, uncomment and configure:
    /*
    if (process.env.OPENWEATHER_API_KEY) {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
        {
          params: {
            q: location,
            appid: process.env.OPENWEATHER_API_KEY,
            units: 'metric'
          }
        }
      );
      
      return {
        description: response.data.weather[0].description,
        temperature: response.data.main.temp,
        humidity: response.data.main.humidity
      };
    }
    */

    // Default mock data for unknown locations
    return {
      description: 'Partly cloudy',
      temperature: 25,
      humidity: 60
    };
  }
}
