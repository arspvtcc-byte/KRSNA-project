import { encode } from 'gpt-tokenizer';

export const TOKEN_LIMITS = {
  MAX_TOTAL_CEILING: 10000,
  MAX_INPUT_TOKENS: 8400,
  MAX_RESERVED_OUTPUT: 1500,
  SAFETY_MARGIN: 100
};

export function countTokens(text) {
  if (!text || typeof text !== 'string') return 0;
  try {
    return encode(text).length;
  } catch {
    return Math.ceil(text.length / 3.2);
  }
}

export function countMessageArrayTokens(messages) {
  if (!Array.isArray(messages)) return 0;
  let total = 0;
  for (const m of messages) {
    total += 4;
    total += countTokens(m.content || '');
    total += countTokens(m.role || '');
  }
  total += 2;
  return total;
}

export function verifyPreflightBudget(assembledMessages, reservedOutput = TOKEN_LIMITS.MAX_RESERVED_OUTPUT) {
  const inputTokens = countMessageArrayTokens(assembledMessages);
  const totalPlanned = inputTokens + reservedOutput;

  if (inputTokens > TOKEN_LIMITS.MAX_INPUT_TOKENS) {
    return {
      safe: false,
      inputTokens,
      reservedOutput,
      totalPlanned,
      reason: `Input tokens (${inputTokens}) exceed cap (${TOKEN_LIMITS.MAX_INPUT_TOKENS})`
    };
  }

  if (totalPlanned + TOKEN_LIMITS.SAFETY_MARGIN > TOKEN_LIMITS.MAX_TOTAL_CEILING) {
    return {
      safe: false,
      inputTokens,
      reservedOutput,
      totalPlanned,
      reason: `Total planned (${totalPlanned}) violates ceiling (${TOKEN_LIMITS.MAX_TOTAL_CEILING})`
    };
  }

  return { safe: true, inputTokens, reservedOutput, totalPlanned };
}
