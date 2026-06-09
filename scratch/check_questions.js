import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const questionsJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../questions.json'), 'utf8'));
const questionIds = new Set(questionsJson.map(q => q.id));

const pages = {
  'ReligiousMirrorsPage': [
    'culture_body_intervention_view', 'final_core_principle_choice', 'final_transparent_monster_resonance',
    'religion_jewish_identity_importance', 'religion_islamic_identity_importance', 'religion_christian_circ_view',
    'religion_jewish_theology_reasons', 'religion_islamic_religious_reasons', 'religion_christian_theology_basis',
    'religion_jewish_alt_interpretations', 'religion_islamic_alt_interpretations', 'religion_christian_comments',
    'religion_jewish_diversity_room', 'religion_islamic_diversity_room'
  ],
  'ObserverTriadPage': [
    'observe_partner_emotional_state', 'observe_partner_observations', 'observe_partner_comm_challenges', 'observe_partner_advice',
    'observe_parent_emotional_state', 'observe_parent_circ_advice', 'observe_parent_intact_factors', 'observe_parent_intact_regret_reconsider',
    'observe_healthcare_blind_spot_v2', 'observe_healthcare_counseling_stance', 'observe_healthcare_complications_seen_v2', 'observe_healthcare_prediction_future_ric'
  ],
  'MirrorPairsPage': [
    'intact_advantages_desc', 'circ_advantages_desc', 'intact_drawbacks_desc', 'circ_drawbacks_desc',
    'intact_circ_awareness_age', 'circ_awareness_age', 'intact_parents_reason', 'circ_parents_reason',
    'intact_parents_driver', 'circ_parents_driver', 'intact_regret_feeling', 'circ_regret_feeling',
    'intact_regret_triggers', 'circ_regret_triggers', 'intact_parents_convo', 'circ_parents_convo',
    'intact_parents_convo_why_not', 'circ_parents_convo_why_not', 'intact_medical_intervention', 'circ_medical_intervention',
    'intact_notice_same_status', 'circ_notice_same_status', 'intact_curiosity_about_circ', 'circ_curiosity_about_intact',
    'intact_curiosity_about_circ_aspects', 'circ_curiosity_about_intact_aspects', 'intact_prior_thought_level', 'circ_prior_thought_level',
    'intact_ppp_awareness', 'circ_ppp_awareness', 'intact_ppp_impact', 'circ_ppp_impact',
    'final_social_norm_perception', 'culture_social_pressure_role', 'final_ethical_consideration_belief', 'final_partner_preference_belief',
    'final_healthier_hygienic_belief', 'final_pleasure_potential_belief', 'final_avg_pleasure_belief', 'final_aesthetic_preference',
    'final_child_decision_reason', 'exp_sex_rating_sensitivity_light_touch', 'exp_sex_rating_pleasure_mobile_skin', 'exp_sex_rating_variety_of_sensation',
    'exp_sex_rating_orgasm_intensity', 'exp_lubrication_need'
  ],
  'GenerationalFaultlinesPage': [
    'exp_pride_satisfaction_rating', 'circ_regret_feeling', 'intact_regret_feeling', 'final_social_norm_perception', 'observe_all_social_climate_discussion',
    'culture_assoc_more_aesthetic', 'culture_assoc_medically_healthier', 'culture_assoc_more_hygienic', 'culture_assoc_more_natural',
    'culture_assoc_more_sensitive', 'culture_assoc_easier_care', 'culture_assoc_more_masculine', 'culture_assoc_more_modern',
    'culture_assoc_more_traditional', 'culture_assoc_more_socially_acceptable', 'culture_assoc_partner_preference', 'culture_assoc_higher_education',
    'culture_assoc_higher_ses', 'culture_assoc_liberal_values', 'culture_assoc_conservative_values'
  ],
  'PleasureGapPage': [
    'exp_sex_rating_ease_of_orgasm', 'exp_sex_rating_sensitivity_light_touch', 'exp_sex_rating_variety_of_sensation', 'exp_sex_rating_orgasm_duration',
    'exp_sex_rating_pleasure_mobile_skin', 'exp_sex_rating_orgasm_intensity'
  ],
  'CorrelationExplorerPage': [
    'family_mother_education', 'family_mother_profession', 'family_father_education', 'family_father_profession',
    'family_ses', 'family_politics', 'family_upbringing_status', 'family_cultural_background', 'family_father_status',
    'demo_generation', 'demo_education_self', 'demo_sexuality', 'demo_gender_identity', 'demo_sex_assigned_at_birth',
    'religion_is_significant', 'religion_primary_tradition', 'religion_christian_denomination', 'religion_jewish_denomination',
    'culture_community_expectation', 'culture_primary_view_of_circ', 'culture_social_pressure_role', 'final_social_norm_perception',
    'circ_regret_feeling', 'intact_regret_feeling', 'exp_appearance_feeling', 'exp_pride_satisfaction_rating'
  ]
};

console.log('--- INVALID QUESTION IDS BY PAGE ---');
for (const [pageName, ids] of Object.entries(pages)) {
  const invalid = ids.filter(id => !questionIds.has(id));
  if (invalid.length > 0) {
    console.log(`${pageName}:`);
    invalid.forEach(id => {
      // Find closest matches
      const keyword = id.replace(/religion_jewish_|religion_islamic_|religion_christian_|observe_/, '');
      const matches = [...questionIds].filter(qid => qid.includes(keyword) || keyword.includes(qid));
      console.log(`  - "${id}" is invalid. Close matches: ${matches.slice(0, 3).join(', ')}`);
    });
  } else {
    console.log(`${pageName}: All IDs are valid.`);
  }
}
