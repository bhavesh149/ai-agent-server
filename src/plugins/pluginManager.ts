import { Plugin, PluginResult } from '../types';
import { WeatherPlugin } from './weatherPlugin';
import { MathPlugin } from './mathPlugin';
import { LLMService } from '../services/llmService';

export class PluginManager {
  private static instance: PluginManager;
  private plugins: Map<string, Plugin> = new Map();
  private llmService: LLMService;

  private constructor() {
    this.llmService = new LLMService();
    this.registerPlugins();
  }

  public static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }

  private registerPlugins(): void {
    const weatherPlugin = new WeatherPlugin();
    const mathPlugin = new MathPlugin();

    this.plugins.set(weatherPlugin.name, weatherPlugin);
    this.plugins.set(mathPlugin.name, mathPlugin);

    console.log(`Registered ${this.plugins.size} plugins:`, Array.from(this.plugins.keys()));
  }

  public async analyzeAndExecute(query: string): Promise<{
    pluginsUsed: string[];
    results: { [pluginName: string]: PluginResult };
    summary: string;
  }> {
    const pluginsUsed: string[] = [];
    const results: { [pluginName: string]: PluginResult } = {};
    
    // Use LLM to dynamically detect which plugins should be used
    const applicablePlugins = await this.identifyApplicablePluginsWithLLM(query);
    
    for (const pluginName of applicablePlugins) {
      const plugin = this.plugins.get(pluginName);
      if (plugin) {
        try {
          console.log(`Executing plugin: ${pluginName}`);
          const result = await plugin.execute(query);
          pluginsUsed.push(pluginName);
          results[pluginName] = result;
        } catch (error) {
          console.error(`Plugin ${pluginName} execution failed:`, error);
          results[pluginName] = {
            success: false,
            data: null,
            error: `Plugin execution failed: ${error}`
          };
        }
      }
    }

    // Generate summary of plugin results
    const summary = this.generateResultsSummary(results);

    return {
      pluginsUsed,
      results,
      summary
    };
  }

  private async identifyApplicablePluginsWithLLM(query: string): Promise<string[]> {
    try {
      // Get available plugins information
      const pluginDescriptions = Array.from(this.plugins.values()).map(plugin => 
        `- ${plugin.name}: ${plugin.description}`
      ).join('\n');

      const intentAnalysisPrompt = `You are a plugin router for an AI agent. Analyze the user query and determine which plugins should be used.

Available plugins:
${pluginDescriptions}

User query: "${query}"

Instructions:
- Return ONLY the plugin names that should be used, separated by commas
- If no plugins are needed, return "none"
- Be specific and only choose plugins that are directly relevant
- You can choose multiple plugins if needed

Examples:
Query: "What's the weather in Tokyo?" → weather
Query: "Calculate 15 + 25" → math  
Query: "What's 2+2 and is it raining in Paris?" → math,weather
Query: "Tell me about markdown" → none

Response (plugin names only):`;

      const response = await this.llmService.generateResponse([{
        role: 'user',
        content: intentAnalysisPrompt,
        timestamp: new Date()
      }], '', '');

      // Parse the response
      const pluginNames = response.trim().toLowerCase();
      
      if (pluginNames === 'none') {
        return [];
      }

      // Extract plugin names from the response
      const identifiedPlugins = pluginNames.split(',')
        .map(name => name.trim())
        .filter(name => this.plugins.has(name));

      console.log(`LLM identified plugins for query "${query}":`, identifiedPlugins);
      return identifiedPlugins;

    } catch (error) {
      console.error('LLM plugin analysis failed, falling back to pattern matching:', error);
      return this.fallbackPatternMatching(query);
    }
  }

  private fallbackPatternMatching(query: string): string[] {
    const applicable: string[] = [];
    const lowerQuery = query.toLowerCase();

    // Fallback weather patterns
    const weatherPatterns = [/weather/i, /forecast/i, /temperature/i, /climate/i, /rain/i, /sunny/i, /cloudy/i];
    if (weatherPatterns.some(pattern => pattern.test(query))) {
      applicable.push('weather');
    }

    // Fallback math patterns  
    const mathPatterns = [/calculate/i, /math/i, /solve/i, /what\s+is\s+\d/i, /\d+\s*[+\-*/]\s*\d+/, /arithmetic/i, /equation/i];
    if (mathPatterns.some(pattern => pattern.test(query))) {
      applicable.push('math');
    }

    return applicable;
  }

  private generateResultsSummary(results: { [pluginName: string]: PluginResult }): string {
    const summaryParts: string[] = [];

    for (const [pluginName, result] of Object.entries(results)) {
      if (result.success && result.data?.message) {
        summaryParts.push(result.data.message);
      } else if (result.error) {
        summaryParts.push(`${pluginName} plugin error: ${result.error}`);
      }
    }

    return summaryParts.join('\n');
  }

  public getAvailablePlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  public getPlugin(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }
}
