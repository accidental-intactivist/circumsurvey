/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { applyLikert, normalizeName, rollUpDistribution, flattenMultiSelect, sortDistribution } from './formatters';

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

  describe('flattenMultiSelect', () => {
    it('flattens family_mother_profession correctly matching parenthetical choices', () => {
      const q = { id: 'family_mother_profession' };
      const dist = [
        { label: 'Education (e.g., K-12 Teacher, Professor, School Administrator), Stay-at-Home Parent / Homemaker', n: 10 },
        { label: 'Healthcare/Medicine (e.g., Doctor, Nurse, Therapist, Technician)', n: 5 },
        { label: 'hairstylist', n: 2 }
      ];
      
      const res = flattenMultiSelect(dist, q);
      
      // Expected output should have 4 items: Education, Stay-at-Home, Healthcare, and hairstylist mapped to Other
      // sorted by n descending: Education (10), Stay-at-Home (10), Healthcare (5), Other (2)
      expect(res.length).toBe(4);
      
      const education = res.find(item => item.label.startsWith('Education'));
      expect(education).toBeDefined();
      expect(education.n).toBe(10);
      
      const sah = res.find(item => item.label.startsWith('Stay-at-Home'));
      expect(sah).toBeDefined();
      expect(sah.n).toBe(10);
      
      const healthcare = res.find(item => item.label.startsWith('Healthcare'));
      expect(healthcare).toBeDefined();
      expect(healthcare.n).toBe(5);
      
      const other = res.find(item => item.label === 'Other');
      expect(other).toBeDefined();
      expect(other.n).toBe(2);
    });

    it('flattens religion_is_significant, combining Culturally, but no items and parsing correctly', () => {
      const q = { id: 'religion_is_significant' };
      const dist = [
        { label: 'Yes, somewhat significant, Culturally, but no (Meaning culturally religious, but not religiously observant/practicing in terms of belief)', n: 10 },
        { label: 'Yes, very significant', n: 5 },
        { label: 'Culturally, but no', n: 2 }
      ];

      const res = flattenMultiSelect(dist, q);

      expect(res.length).toBe(3);
      
      const verySig = res.find(item => item.label === 'Yes, very significant');
      expect(verySig).toBeDefined();
      expect(verySig.n).toBe(5);

      const somewhatSig = res.find(item => item.label === 'Yes, somewhat significant');
      expect(somewhatSig).toBeDefined();
      expect(somewhatSig.n).toBe(10);

      // The 10 from Culturally, but no (Meaning...) and the 2 from Culturally, but no should be summed to 12
      const culturally = res.find(item => item.label === 'Culturally, but no (Meaning culturally religious, but not religiously observant/practicing in terms of belief)');
      expect(culturally).toBeDefined();
      expect(culturally.n).toBe(12);
    });

    it('flattens religion_jewish_brit_milah_view without splitting commas inside options', () => {
      const q = { id: 'religion_jewish_brit_milah_view' };
      const dist = [
        { label: 'As a practice open to discussion, with varying opinions on its necessity or form in modern times., As an important tradition and cultural marker, though perhaps with some flexibility in interpretation or practice.', n: 3 },
        { label: 'Not a significant topic of discussion or emphasis in my specific context.', n: 1 }
      ];

      const res = flattenMultiSelect(dist, q);

      expect(res.length).toBe(3);

      const discussion = res.find(item => item.label === 'As a practice open to discussion, with varying opinions on its necessity or form in modern times.');
      expect(discussion).toBeDefined();
      expect(discussion.n).toBe(3);

      const tradition = res.find(item => item.label === 'As an important tradition and cultural marker, though perhaps with some flexibility in interpretation or practice.');
      expect(tradition).toBeDefined();
      expect(tradition.n).toBe(3);

      const notSignificant = res.find(item => item.label === 'Not a significant topic of discussion or emphasis in my specific context.');
      expect(notSignificant).toBeDefined();
      expect(notSignificant.n).toBe(1);
    });

    it('flattens religion_jewish_alternatives_awareness without splitting commas', () => {
      const q = { id: 'religion_jewish_alternatives_awareness' };
      const dist = [
        { label: 'Yes, extensively, Yes, somewhat', n: 5 },
        { label: "Aware of them, but haven't deeply explored, No, not really", n: 2 }
      ];

      const res = flattenMultiSelect(dist, q);

      expect(res.length).toBe(4);

      const extensively = res.find(item => item.label === 'Yes, extensively');
      expect(extensively).toBeDefined();
      expect(extensively.n).toBe(5);

      const somewhat = res.find(item => item.label === 'Yes, somewhat');
      expect(somewhat).toBeDefined();
      expect(somewhat.n).toBe(5);

      const aware = res.find(item => item.label === "Aware of them, but haven't deeply explored");
      expect(aware).toBeDefined();
      expect(aware.n).toBe(2);

      const noNotReally = res.find(item => item.label === 'No, not really');
      expect(noNotReally).toBeDefined();
      expect(noNotReally.n).toBe(2);
    });

    it('flattens religion_islamic_alternatives_awareness without splitting commas', () => {
      const q = { id: 'religion_islamic_alternatives_awareness' };
      const dist = [
        { label: 'Yes, extensively, Yes, somewhat', n: 5 }
      ];
      const res = flattenMultiSelect(dist, q);
      expect(res.length).toBe(2);
      expect(res.find(item => item.label === 'Yes, extensively').n).toBe(5);
    });

    it('flattens religion_islamic_alternatives_thoughts paragraph choices correctly', () => {
      const q = { id: 'religion_islamic_alternatives_thoughts' };
      const dist = [
        { label: "I'm not a muslim, my dad is., Utter bullshit like the rest of this seventh century cult", n: 3 }
      ];
      const res = flattenMultiSelect(dist, q);
      expect(res.length).toBe(2);
      expect(res.find(item => item.label === "I'm not a muslim, my dad is.").n).toBe(3);
      expect(res.find(item => item.label === "Utter bullshit like the rest of this seventh century cult").n).toBe(3);
    });

    it('flattens religion_islamic_intact_reconciliation preserving internal newlines', () => {
      const q = { id: 'religion_islamic_intact_reconciliation' };
      const dist = [
        { label: "Its never been talked about as its a somewhat taboo topic., Well they don't...\nIt's not much thought done about it.\nIt's just what Muslim boys have to go through.\nNot much to think of from their side or to reconcile.", n: 2 }
      ];
      const res = flattenMultiSelect(dist, q);
      expect(res.length).toBe(2);
      expect(res.find(item => item.label === "Its never been talked about as its a somewhat taboo topic.").n).toBe(2);
      
      const expectedLongLabel = "Well they don't...\nIt's not much thought done about it.\nIt's just what Muslim boys have to go through.\nNot much to think of from their side or to reconcile.";
      expect(res.find(item => item.label === expectedLongLabel).n).toBe(2);
    });
  });

  describe('sortDistribution', () => {
    it('sorts family_politics correctly from conservative to liberal', () => {
      const q = { id: 'family_politics' };
      const dist = [
        { label: 'Moderate / Centrist', n: 100 },
        { label: 'Liberal / Progressive', n: 50 },
        { label: 'Very Conservative / Right-Leaning', n: 20 },
        { label: 'Libertarian', n: 10 },
        { label: 'Conservative', n: 80 },
        { label: 'Apolitical / Not focused on politics', n: 15 },
        { label: 'Very Liberal / Progressive / Left-Leaning', n: 30 },
        { label: 'Prefer not to say / Unsure', n: 5 }
      ];

      const res = sortDistribution(dist, q);

      expect(res[0].label).toBe('Very Conservative / Right-Leaning');
      expect(res[1].label).toBe('Conservative');
      expect(res[2].label).toBe('Moderate / Centrist');
      expect(res[3].label).toBe('Liberal / Progressive');
      expect(res[4].label).toBe('Very Liberal / Progressive / Left-Leaning');
      expect(res[5].label).toBe('Libertarian');
      expect(res[6].label).toBe('Apolitical / Not focused on politics');
      expect(res[7].label).toBe('Prefer not to say / Unsure');
    });

    it('sorts demographics politics filters correctly', () => {
      const q = { id: 'politics' };
      const dist = [
        { label: 'Very liberal / progressive', n: 30 },
        { label: 'Liberal / progressive', n: 50 },
        { label: 'Moderate / centrist', n: 100 },
        { label: 'Conservative / traditional', n: 80 },
        { label: 'Very conservative / traditional', n: 20 },
        { label: 'Libertarian', n: 10 },
        { label: 'Other / mixed / non-traditional', n: 15 },
        { label: 'Apolitical / prefer not to say', n: 5 }
      ];

      const res = sortDistribution(dist, q);

      expect(res[0].label).toBe('Very conservative / traditional');
      expect(res[1].label).toBe('Conservative / traditional');
      expect(res[2].label).toBe('Moderate / centrist');
      expect(res[3].label).toBe('Liberal / progressive');
      expect(res[4].label).toBe('Very liberal / progressive');
      expect(res[5].label).toBe('Libertarian');
      expect(res[6].label).toBe('Apolitical / prefer not to say');
      expect(res[7].label).toBe('Other / mixed / non-traditional');
    });

    it('sorts generations chronologically from Alpha to Silent', () => {
      const q = { id: 'demo_generation' };
      const dist = [
        { label: 'Millennial/Gen Y (born 1981-1996)', n: 175 },
        { label: 'Generation Alpha (born 2013-Present)', n: 5 },
        { label: 'Generation Z (born 1997-2012)', n: 130 },
        { label: 'Baby Boomer (born 1946-1964)', n: 45 },
        { label: 'Generation X (born 1965-1980)', n: 64 },
        { label: 'Silent Generation (born 1928-1945)', n: 10 },
        { label: 'Xennial/Oregon Trail (born approx. 1977-1983)', n: 24 }
      ];

      const res = sortDistribution(dist, q);

      expect(res[0].label).toBe('Generation Alpha (born 2013-Present)');
      expect(res[1].label).toBe('Generation Z (born 1997-2012)');
      expect(res[2].label).toBe('Millennial/Gen Y (born 1981-1996)');
      expect(res[3].label).toBe('Xennial/Oregon Trail (born approx. 1977-1983)');
      expect(res[4].label).toBe('Generation X (born 1965-1980)');
      expect(res[5].label).toBe('Baby Boomer (born 1946-1964)');
      expect(res[6].label).toBe('Silent Generation (born 1928-1945)');
    });

    it('sorts religion_is_significant from most to least significant', () => {
      const q = { id: 'religion_is_significant' };
      const dist = [
        { label: 'Culturally, but no', n: 15 },
        { label: 'Yes, somewhat significant', n: 50 },
        { label: 'Not at all significant', n: 20 },
        { label: 'Yes, very significant', n: 10 },
        { label: 'Culturally, but no (Meaning culturally religious, but not religiously observant/practicing in terms of belief)', n: 30 },
        { label: 'Not at all significant / I have no religious or spiritual background.', n: 25 },
        { label: 'Prefer not to say', n: 5 }
      ];

      const res = sortDistribution(dist, q);

      expect(res[0].label).toBe('Yes, very significant');
      expect(res[1].label).toBe('Yes, somewhat significant');
      expect(res[2].label).toBe('Culturally, but no (Meaning culturally religious, but not religiously observant/practicing in terms of belief)');
      expect(res[3].label).toBe('Culturally, but no');
      expect(res[4].label).toBe('Not at all significant / I have no religious or spiritual background.');
      expect(res[5].label).toBe('Not at all significant');
      expect(res[6].label).toBe('Prefer not to say');
    });

    it('sorts religion_jewish_brit_milah_view from strict/traditional to critical/uninvolved', () => {
      const q = { id: 'religion_jewish_brit_milah_view' };
      const dist = [
        { label: 'As a practice open to discussion, with varying opinions on its necessity or form in modern times.', n: 5 },
        { label: 'As a non-negotiable religious commandment (mitzvah) central to Jewish identity.', n: 2 },
        { label: 'Not a significant topic of discussion or emphasis in my specific context.', n: 1 },
        { label: 'As a practice that some in my community/family questioned or chose alternatives to.', n: 4 },
        { label: 'As an important tradition and cultural marker, though perhaps with some flexibility in interpretation or practice.', n: 3 }
      ];

      const res = sortDistribution(dist, q);

      expect(res[0].label).toBe('As a non-negotiable religious commandment (mitzvah) central to Jewish identity.');
      expect(res[1].label).toBe('As an important tradition and cultural marker, though perhaps with some flexibility in interpretation or practice.');
      expect(res[2].label).toBe('As a practice open to discussion, with varying opinions on its necessity or form in modern times.');
      expect(res[3].label).toBe('As a practice that some in my community/family questioned or chose alternatives to.');
      expect(res[4].label).toBe('Not a significant topic of discussion or emphasis in my specific context.');
    });

    it('sorts religion_jewish_alternatives_awareness from high to low awareness', () => {
      const q = { id: 'religion_jewish_alternatives_awareness' };
      const dist = [
        { label: "Aware of them, but haven't deeply explored", n: 5 },
        { label: 'Yes, somewhat', n: 2 },
        { label: 'No, not really', n: 1 },
        { label: 'Yes, extensively', n: 3 }
      ];

      const res = sortDistribution(dist, q);

      expect(res[0].label).toBe('Yes, extensively');
      expect(res[1].label).toBe('Yes, somewhat');
      expect(res[2].label).toBe("Aware of them, but haven't deeply explored");
      expect(res[3].label).toBe('No, not really');
    });

    it('sorts religion_islamic_alternatives_awareness from high to low awareness', () => {
      const q = { id: 'religion_islamic_alternatives_awareness' };
      const dist = [
        { label: 'Not interested in such interpretations', n: 5 },
        { label: 'Yes, somewhat', n: 2 },
        { label: 'Yes, extensively', n: 3 },
        { label: "Aware of them, but haven't deeply explored", n: 4 }
      ];

      const res = sortDistribution(dist, q);

      expect(res[0].label).toBe('Yes, extensively');
      expect(res[1].label).toBe('Yes, somewhat');
      expect(res[2].label).toBe("Aware of them, but haven't deeply explored");
      expect(res[3].label).toBe('Not interested in such interpretations');
    });

    it('sorts exp_orgasm_duration_desc according to custom duration slots', () => {
      const q = { id: 'exp_orgasm_duration_desc' };
      const dist = [
        { label: 'Longer than 1 minute', n: 10 },
        { label: '16-30 seconds', n: 20 },
        { label: '0-5 seconds', n: 5 },
        { label: 'The duration varies too much to give a typical answer', n: 30 },
        { label: '6-15 seconds', n: 15 },
        { label: "Unsure / Haven't thought about it in terms of time", n: 2 },
        { label: 'Up to 1 minute', n: 8 }
      ];

      const res = sortDistribution(dist, q);

      expect(res[0].label).toBe('0-5 seconds');
      expect(res[1].label).toBe('6-15 seconds');
      expect(res[2].label).toBe('16-30 seconds');
      expect(res[3].label).toBe('Up to 1 minute');
      expect(res[4].label).toBe('Longer than 1 minute');
      expect(res[5].label).toBe('The duration varies too much to give a typical answer');
      expect(res[6].label).toBe("Unsure / Haven't thought about it in terms of time");
    });

    it('leaves unrelated questions unsorted', () => {
      const q = { id: 'demo_country_born' };
      const dist = [
        { label: 'USA', n: 100 },
        { label: 'Canada', n: 50 }
      ];

      const res = sortDistribution(dist, q);
      expect(res).toEqual(dist);
    });

    it('flattens exp_pre_ejaculate_awareness without splitting commas', () => {
      const q = { id: 'exp_pre_ejaculate_awareness' };
      const dist = [
        { label: 'A Moderate Amount: I produce a noticeable amount, None or Barely Noticeable: I produce very little to no noticeable pre-ejaculate.', n: 10 }
      ];
      const res = flattenMultiSelect(dist, q);
      expect(res.length).toBe(2);
      expect(res.find(item => item.label.includes('Moderate Amount')).n).toBe(10);
      expect(res.find(item => item.label.includes('None or Barely')).n).toBe(10);
    });

    it('sorts exp_pre_ejaculate_awareness logically', () => {
      const q = { id: 'exp_pre_ejaculate_awareness' };
      const dist = [
        { label: "Unsure / I haven't paid attention to this.", n: 1 },
        { label: 'A Small Amount: I typically notice a drop or two, or a slight moistness at the tip of my penis.', n: 3 },
        { label: 'A Significant Amount: I produce a significant amount', n: 4 },
        { label: 'None or Barely Noticeable: I produce very little to no noticeable pre-ejaculate.', n: 2 }
      ];
      const res = sortDistribution(dist, q);
      expect(res[0].label).toBe('A Significant Amount: I produce a significant amount');
      expect(res[1].label).toBe('A Small Amount: I typically notice a drop or two, or a slight moistness at the tip of my penis.');
      expect(res[2].label).toBe('None or Barely Noticeable: I produce very little to no noticeable pre-ejaculate.');
      expect(res[3].label).toBe("Unsure / I haven't paid attention to this.");
    });

    it('sorts intact_parents_convo and circ_parents_convo logically', () => {
      const q = { id: 'circ_parents_convo' };
      const dist = [
        { label: 'No, I have never asked them about their decision.', n: 5 },
        { label: "Yes, I've had a detailed conversation and have a clear understanding of their reasons at the time.", n: 2 }
      ];
      const res = sortDistribution(dist, q);
      expect(res[0].label).toBe("Yes, I've had a detailed conversation and have a clear understanding of their reasons at the time.");
      expect(res[1].label).toBe('No, I have never asked them about their decision.');
    });

    it('sorts circ_age logically', () => {
      const q = { id: 'circ_age' };
      const dist = [
        { label: 'Adulthood', n: 1 },
        { label: 'Neonatal/Infant (within first few weeks/months)', n: 5 },
        { label: 'Childhood (after infancy, before puberty)', n: 2 }
      ];
      const res = sortDistribution(dist, q);
      expect(res[0].label).toBe('Neonatal/Infant (within first few weeks/months)');
      expect(res[1].label).toBe('Childhood (after infancy, before puberty)');
      expect(res[2].label).toBe('Adulthood');
    });

    it('flattens circ_regret_feeling keeping No, never intact', () => {
      const q = { id: 'circ_regret_feeling' };
      const dist = [
        { label: 'Yes, I experience some of these feelings sometimes, No, never', n: 5 }
      ];
      const res = flattenMultiSelect(dist, q);
      expect(res.length).toBe(2);
      expect(res.find(item => item.label === 'No, never').n).toBe(5);
    });

    it('sorts family_sibling_status from all to none/mix', () => {
      const q = { id: 'family_sibling_status' };
      const dist = [
        { label: 'There is a mix: I am circumcised, but I have at least one sibling who is intact.', n: 2 },
        { label: 'All of us are the same: All my brothers and I are CIRCUMCISED.', n: 5 }
      ];
      const res = sortDistribution(dist, q);
      expect(res[0].label).toBe('All of us are the same: All my brothers and I are CIRCUMCISED.');
      expect(res[1].label).toBe('There is a mix: I am circumcised, but I have at least one sibling who is intact.');
    });

    it('sorts restore_duration from complete to least', () => {
      const q = { id: 'restore_duration' };
      const dist = [
        { label: '1-2 years', n: 5 },
        { label: "I consider myself 'complete' or have achieved my goals and stopped active tugging", n: 2 },
        { label: 'More than 10 years', n: 10 }
      ];
      const res = sortDistribution(dist, q);
      expect(res[0].label).toBe("I consider myself 'complete' or have achieved my goals and stopped active tugging");
      expect(res[1].label).toBe('More than 10 years');
      expect(res[2].label).toBe('1-2 years');
    });

    it('flattens and sorts restore_rci_start / restore_rci_current', () => {
      const qStart = { id: 'restore_rci_start' };
      const distStart = [
        { label: 'RCI-0 (Super tight cut, very little, if any, skin mobility hard or soft), RCI-2 (Medium cut, can pull skin to corona (head) when soft)', n: 5 }
      ];
      const resStart = flattenMultiSelect(distStart, qStart);
      expect(resStart.length).toBe(2);
      expect(resStart.find(item => item.label.includes('RCI-0')).n).toBe(5);

      const qCurrent = { id: 'restore_rci_current' };
      const distCurrent = [
        { label: 'RCI-2', n: 5 },
        { label: 'RCI-10 (Full Erect Coverage with overhang)', n: 2 },
        { label: 'RCI-1', n: 10 }
      ];
      const sortedCurrent = sortDistribution(distCurrent, qCurrent);
      expect(sortedCurrent[0].label).toBe('RCI-1');
      expect(sortedCurrent[1].label).toBe('RCI-2');
      expect(sortedCurrent[2].label).toBe('RCI-10 (Full Erect Coverage with overhang)');
    });

    it('flattens and sorts restore_regen_tech_awareness', () => {
      const q = { id: 'restore_regen_tech_awareness' };
      const dist = [
        { label: "Yes, I'm familiar with specific organizations/research (e.g., Foregen), Yes, I've heard the concept exists, but no specifics", n: 3 }
      ];
      const flattened = flattenMultiSelect(dist, q);
      expect(flattened.length).toBe(2);
      expect(flattened.find(item => item.label.includes('Foregen')).n).toBe(3);

      const sorted = sortDistribution(flattened, q);
      expect(sorted[0].label).toBe("Yes, I'm familiar with specific organizations/research (e.g., Foregen)");
      expect(sorted[1].label).toBe("Yes, I've heard the concept exists, but no specifics");
    });

    it('flattens observe_motivation preventing comma splitting', () => {
      const q = { id: 'observe_motivation' };
      const dist = [
        { label: 'I am the PARTNER of a man (intact, circumcised, or restoring)., I am an ADVOCATE ALLY, or INTACTIVIST', n: 4 }
      ];
      const flattened = flattenMultiSelect(dist, q);
      expect(flattened.length).toBe(2);
      expect(flattened.find(item => item.label.includes('PARTNER')).n).toBe(4);
      expect(flattened.find(item => item.label.includes('ADVOCATE')).n).toBe(4);
    });

    it('sorts culture_assoc_* questions correctly', () => {
      const q = { id: 'culture_assoc_medically_healthier' };
      const dist = [
        { label: 'Unsure / Don\'t Know', n: 5 },
        { label: 'Definitely Circumcised', n: 10 },
        { label: 'No Significant Difference / Equally Likely', n: 3 },
        { label: 'Likely Intact', n: 2 }
      ];
      const res = sortDistribution(dist, q);
      expect(res[0].label).toBe('Definitely Circumcised');
      expect(res[1].label).toBe('No Significant Difference / Equally Likely');
      expect(res[2].label).toBe('Likely Intact');
      expect(res[3].label).toBe('Unsure / Don\'t Know');
    });

    it('sorts circ_notice_same_status and other notice status questions logically', () => {
      const q = { id: 'circ_notice_same_status' };
      const dist = [
        { label: 'I rarely notice or pay attention to this specifically.', n: 5 },
        { label: 'I almost always notice and am very aware of this.', n: 10 },
        { label: 'Not applicable / I am rarely or never in such situations.', n: 3 },
        { label: 'I frequently notice.', n: 12 },
        { label: 'I never really notice or think about this.', n: 2 },
        { label: 'I sometimes notice.', n: 8 }
      ];
      const res = sortDistribution(dist, q);
      expect(res[0].label).toBe('I almost always notice and am very aware of this.');
      expect(res[1].label).toBe('I frequently notice.');
      expect(res[2].label).toBe('I sometimes notice.');
      expect(res[3].label).toBe('I rarely notice or pay attention to this specifically.');
      expect(res[4].label).toBe('I never really notice or think about this.');
      expect(res[5].label).toBe('Not applicable / I am rarely or never in such situations.');
    });
  });
});

