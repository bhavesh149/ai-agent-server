import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000'),
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY,
  groqApiKey: process.env.GROQ_API_KEY,
  openWeatherBaseUrl: 'https://api.openweathermap.org/data/2.5',
  maxMemoryMessages: 10,
  ragTopK: 3,
  chunkSize: 500,
  chunkOverlap: 50,
  chromaHost: process.env.CHROMA_HOST || 'localhost',
  chromaPort: parseInt(process.env.CHROMA_PORT || '8000')
};

if (!config.openWeatherApiKey) {
  throw new Error('OPENWEATHER_API_KEY is required');
}

if (!config.groqApiKey) {
  throw new Error('GROQ_API_KEY is required');
}

