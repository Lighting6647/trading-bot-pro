export function calculatePreview(strategy: string, startAmount: number, steps: number): number[] {
  const result: number[] = [];
  
  if (steps <= 0) return [];
  
  let a = 1, b = 1;

  for (let i = 0; i < steps; i++) {
    let multiplier = 1;
    switch (strategy) {
      case 'Martingale':
      case 'Anti-Martingale':
        multiplier = Math.pow(2, i);
        break;
      case 'Fibonacci':
        if (i === 0) multiplier = 1;
        else if (i === 1) multiplier = 1;
        else {
          multiplier = a + b;
          a = b;
          b = multiplier;
        }
        break;
      case '1-3-2-6':
        const cycle = [1, 3, 2, 6];
        multiplier = cycle[i % 4];
        break;
      case 'Flat':
        multiplier = 1;
        break;
      case "Oscar's Grind":
        multiplier = i + 1; // Simplified
        break;
      case "D'Alembert":
        multiplier = i + 1; // Simplified
        break;
      default:
        multiplier = Math.pow(2, i);
    }
    result.push(startAmount * multiplier);
  }
  return result;
}
