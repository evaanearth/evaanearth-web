import test from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../src/utils/slugify.js';

test('product slugs are stable and URL-safe', () => {
  assert.equal(slugify('Handmade Haldi & Lemon Soap'), 'handmade-haldi-lemon-soap');
});
