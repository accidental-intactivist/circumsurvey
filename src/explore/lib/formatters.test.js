/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { applyLikert, normalizeName, rollUpDistribution } from './formatters';

describe('Data Formatters', () => {
  describe('applyLikert', () => {
    it('normalizes decimal strings to ints', () => {
      const dist = [{ label: '3.0', n: 10 }];
      const q = { id: 'religion_jewish_identity_importance', type: 'likert' };
      const res = applyLikert(dist, q);
      expect(res[0].label).toBe('3');
    });

    it('replaces 1 with Extremely Important', () => {
      const dist = [{ label: '1.0', n: 5 }];
      const q = { id: 'some_importance_question', type: 'single_select' };
      const res = applyLikert(dist, q);
      expect(res[0].label).toBe('1 - Extremely Important');
    });

    it('replaces 5 with Not Important At All', () => {
      const dist = [{ label: '5.0', n: 2 }];
      const q = { id: 'importance_of_x', type: 'likert' };
      const res = applyLikert(dist, q);
      expect(res[0].label).toBe('5 - Not Important At All');
    });

    it('does nothing if the question does not contain importance', () => {
      const dist = [{ label: '1.0', n: 2 }];
      const q = { id: 'some_other_question', type: 'likert' };
      const res = applyLikert(dist, q);
      expect(res[0].label).toBe('1.0');
    });
  });

  describe('normalizeName', () => {
    it('handles UK variants', () => {
      expect(normalizeName('England')).toBe('United Kingdom');
      expect(normalizeName('Scotland')).toBe('United Kingdom');
      expect(normalizeName('Great Britain')).toBe('United Kingdom');
      expect(normalizeName('uk')).toBe('United Kingdom');
    });

    it('handles US variants', () => {
      expect(normalizeName('USA')).toBe('United States');
      expect(normalizeName('United States of America (USA)')).toBe('United States');
      expect(normalizeName('U.S.')).toBe('United States');
    });

    it('handles Australia variants', () => {
      expect(normalizeName('Perth/Southern Australia')).toBe('Australia');
      expect(normalizeName('NSW')).toBe('Australia');
      expect(normalizeName('Queensland')).toBe('Australia');
      expect(normalizeName('Victoria')).toBe('Australia');
      expect(normalizeName('Tasmania')).toBe('Australia');
    });

    it('handles Canadian Province abbreviations', () => {
      expect(normalizeName('bc')).toBe('British Columbia');
      expect(normalizeName('AB')).toBe('Alberta');
      expect(normalizeName('ON')).toBe('Ontario');
      expect(normalizeName('QC')).toBe('Quebec');
      expect(normalizeName('PQ')).toBe('Quebec');
      expect(normalizeName('NL')).toBe('Newfoundland and Labrador');
      expect(normalizeName('Newfoundland')).toBe('Newfoundland and Labrador');
    });

    it('strips state prefixes and title cases', () => {
      expect(normalizeName('wa - washington')).toBe('Washington');
      expect(normalizeName('tx - texas')).toBe('Texas');
      expect(normalizeName('ontario')).toBe('Ontario');
      expect(normalizeName('british columbia')).toBe('British Columbia');
    });
  });

  describe('rollUpDistribution', () => {
    it('combines duplicates', () => {
      const input = [
        { label: 'England', n: 10 },
        { label: 'Scotland', n: 5 },
        { label: 'USA', n: 20 },
        { label: 'United States', n: 10 }
      ];
      
      const res = rollUpDistribution(input);
      
      expect(res.length).toBe(2);
      // It sorts by n descending
      expect(res[0].label).toBe('United States');
      expect(res[0].n).toBe(30);
      
      expect(res[1].label).toBe('United Kingdom');
      expect(res[1].n).toBe(15);
    });
  });
});
