import { BasePlugin } from './basePlugin';
import { PluginResult } from '../types';

export class MathPlugin extends BasePlugin {
  name = 'math';
  description = 'Evaluate mathematical expressions and solve calculations';

  async execute(query: string): Promise<PluginResult> {
    try {
      const expression = this.extractMathExpression(query);
      if (!expression) {
        return this.createErrorResult('Could not extract mathematical expression from query');
      }

      const result = this.evaluateExpression(expression);
      
      return this.createSuccessResult({
        expression,
        result,
        message: `${expression} = ${result}`
      });
    } catch (error) {
      return this.createErrorResult(`Math evaluation failed: ${error}`);
    }
  }

  private extractMathExpression(query: string): string | null {
    // Patterns to extract mathematical expressions
    const patterns = [
      /calculate\s+(.+)/i,
      /what\s+is\s+(.+)/i,
      /solve\s+(.+)/i,
      /(\d+(?:\.\d+)?(?:\s*[+\-*/]\s*\d+(?:\.\d+)?)+)/,
      /([0-9+\-*/().\s]+)/
    ];

    for (const pattern of patterns) {
      const match = query.match(pattern);
      if (match && match[1]) {
        const expr = match[1].trim();
        // Validate that it looks like a math expression
        if (this.isValidMathExpression(expr)) {
          return expr;
        }
      }
    }

    return null;
  }

  private isValidMathExpression(expr: string): boolean {
    // Check if the expression contains only allowed characters
    const allowedChars = /^[0-9+\-*/().\s]+$/;
    if (!allowedChars.test(expr)) {
      return false;
    }

    // Check if it has at least one operator
    const hasOperator = /[+\-*/]/.test(expr);
    return hasOperator;
  }

  private evaluateExpression(expression: string): number {
    // Clean and validate the expression
    const cleanExpr = expression.replace(/\s+/g, '');
    
    // Basic security check - only allow numbers, operators, and parentheses
    if (!/^[0-9+\-*/().]+$/.test(cleanExpr)) {
      throw new Error('Invalid characters in expression');
    }

    // Prevent potential security issues
    if (cleanExpr.includes('++') || cleanExpr.includes('--')) {
      throw new Error('Invalid operator sequence');
    }

    try {
      // Use a safe evaluation method
      const result = this.safeEval(cleanExpr);
      
      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error('Result is not a valid number');
      }
      
      return Math.round(result * 1000000) / 1000000; // Round to 6 decimal places
    } catch (error) {
      throw new Error(`Invalid mathematical expression: ${error}`);
    }
  }

  private safeEval(expression: string): number {
    // Simple recursive descent parser for basic arithmetic
    let index = 0;

    const peek = (): string => expression[index] || '';
    const consume = (): string => expression[index++] || '';

    const parseNumber = (): number => {
      let num = '';
      while (index < expression.length && /[0-9.]/.test(peek())) {
        num += consume();
      }
      return parseFloat(num);
    };

    const parseFactor = (): number => {
      if (peek() === '(') {
        consume(); // consume '('
        const result = parseExpression();
        consume(); // consume ')'
        return result;
      }
      
      if (peek() === '-') {
        consume();
        return -parseFactor();
      }
      
      if (peek() === '+') {
        consume();
        return parseFactor();
      }
      
      return parseNumber();
    };

    const parseTerm = (): number => {
      let result = parseFactor();
      
      while (peek() === '*' || peek() === '/') {
        const op = consume();
        const right = parseFactor();
        if (op === '*') {
          result *= right;
        } else {
          if (right === 0) throw new Error('Division by zero');
          result /= right;
        }
      }
      
      return result;
    };

    const parseExpression = (): number => {
      let result = parseTerm();
      
      while (peek() === '+' || peek() === '-') {
        const op = consume();
        const right = parseTerm();
        if (op === '+') {
          result += right;
        } else {
          result -= right;
        }
      }
      
      return result;
    };

    return parseExpression();
  }
}
