import { Plugin, PluginResult } from '../types';

export abstract class BasePlugin implements Plugin {
  abstract name: string;
  abstract description: string;

  abstract execute(query: string): Promise<PluginResult>;

  protected createSuccessResult(data: any): PluginResult {
    return {
      success: true,
      data
    };
  }

  protected createErrorResult(error: string): PluginResult {
    return {
      success: false,
      data: null,
      error
    };
  }
}
