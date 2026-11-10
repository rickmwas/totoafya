/**
 * TotoAfya Digital - Design System Master Export
 * "The Sunlit Botanical Editorial"
 */

import { createRequire } from 'node:module';
import tokensJsonData from './tokens.json' with { type: 'json' };

export * from './tokens.ts';
export * from './contrast-rules.ts';
export * from './swahili-rules.ts';

export const tokensJson = tokensJsonData;

const require = createRequire(import.meta.url);
export const tailwindPreset = require('./tailwind-preset.js');
export default tailwindPreset;
