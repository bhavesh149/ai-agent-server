import { MathResult, PluginResult } from '../types';

export class MathPlugin {
  async execute(expression: string): Promise<PluginResult> {
    const startTime = Date.now();
    console.log(`🧮 [TOOL CALLED] Math Plugin - Expression: ${expression}`);
    
    try {
      // Clean and validate the expression
      const cleanExpression = this.sanitizeExpression(expression);
      
      if (!this.isValidExpression(cleanExpression)) {
        const executionTime = Date.now() - startTime;
        console.error(`❌ [TOOL ERROR] Math Plugin - Invalid expression: ${cleanExpression} - Execution time: ${executionTime}ms`);
        
        return {
          pluginName: 'math',
          result: null,
          success: false,
          error: 'Invalid mathematical expression'
        };
      }

      // Evaluate the expression safely
      const result = this.evaluateExpression(cleanExpression);

      const mathResult: MathResult = {
        expression: cleanExpression,
        result: result
      };

      const executionTime = Date.now() - startTime;
      console.log(`✅ [TOOL SUCCESS] Math Plugin - Result: ${result} - Execution time: ${executionTime}ms`);

      return {
        pluginName: 'math',
        result: mathResult,
        success: true
      };
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      console.error(`❌ [TOOL ERROR] Math Plugin - Execution time: ${executionTime}ms, Error:`, error.message);
      
      return {
        pluginName: 'math',
        result: null,
        success: false,
        error: 'Failed to evaluate mathematical expression'
      };
    }
  }

  private sanitizeExpression(expression: string): string {
    // Remove spaces and convert to lowercase
    let clean = expression.replace(/\s+/g, '').toLowerCase();
    
    // Replace common word representations
    clean = clean.replace(/plus/g, '+');
    clean = clean.replace(/minus/g, '-');
    clean = clean.replace(/times/g, '*');
    clean = clean.replace(/multiplied\s*by/g, '*');
    clean = clean.replace(/divided\s*by/g, '/');
    clean = clean.replace(/equals?/g, '');
    clean = clean.replace(/what\s*is/g, '');
    clean = clean.replace(/calculate/g, '');
    clean = clean.replace(/[?]/g, '');
    
    return clean;
  }

  private isValidExpression(expression: string): boolean {
    // Only allow numbers, basic operators, parentheses, and decimal points
    const validPattern = /^[0-9+\-*/().\s]+$/;
    return validPattern.test(expression) && expression.length > 0;
  }

  private evaluateExpression(expression: string): number {
    // Simple recursive descent parser for basic arithmetic
    const tokens = this.tokenize(expression);
    let index = 0;

    const parseExpression = (): number => {
      let result = parseTerm();
      
      while (index < tokens.length && (tokens[index] === '+' || tokens[index] === '-')) {
        const operator = tokens[index++];
        const term = parseTerm();
        result = operator === '+' ? result + term : result - term;
      }
      
      return result;
    };

    const parseTerm = (): number => {
      let result = parseFactor();
      
      while (index < tokens.length && (tokens[index] === '*' || tokens[index] === '/')) {
        const operator = tokens[index++];
        const factor = parseFactor();
        result = operator === '*' ? result * factor : result / factor;
      }
      
      return result;
    };

    const parseFactor = (): number => {
      if (tokens[index] === '(') {
        index++; // consume '('
        const result = parseExpression();
        index++; // consume ')'
        return result;
      }
      
      if (tokens[index] === '-') {
        index++; // consume '-'
        return -parseFactor();
      }
      
      return parseFloat(tokens[index++]);
    };

    return parseExpression();
  }

  private tokenize(expression: string): string[] {
    const tokens: string[] = [];
    let current = '';
    
    for (const char of expression) {
      if ('+-*/()'.includes(char)) {
        if (current) {
          tokens.push(current);
          current = '';
        }
        tokens.push(char);
      } else if (char.match(/[0-9.]/)) {
        current += char;
      }
    }
    
    if (current) {
      tokens.push(current);
    }
    
    return tokens;
  }

  static detectIntent(message: string): { isMathQuery: boolean; expression?: string } {
    const mathKeywords = ['calculate', 'compute', 'evaluate', 'solve', 'what is', 'equals', '='];
    const lowerMessage = message.toLowerCase();
    
    const hasMathKeyword = mathKeywords.some(keyword => lowerMessage.includes(keyword));
    const hasMathOperators = /[+\-*/=]/.test(message);
    const hasNumbers = /\d/.test(message);
    
    if (!((hasMathKeyword && hasNumbers) || (hasMathOperators && hasNumbers))) {
      return { isMathQuery: false };
    }

    // Extract the mathematical expression
    let expression = message;
    
    // Remove common prefixes
    expression = expression.replace(/^(what\s+is|calculate|compute|evaluate|solve)\s*/i, '');
    expression = expression.replace(/[?!.]*$/, ''); // Remove trailing punctuation
    
    return { isMathQuery: true, expression: expression.trim() };
  }
}

