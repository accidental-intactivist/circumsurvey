const fs = require('fs'); 
const data = JSON.parse(fs.readFileSync('public/data/survey_data_anon.json')); 
const qs = [
  'final_social_norm_perception', 
  'observe_all_social_climate_discussion', 
  'final_avg_pleasure_belief', 
  'final_healthier_hygienic_belief', 
  'final_partner_preference_belief', 
  'culture_primary_view_of_circ'
]; 
qs.forEach(q => { 
  const set = new Set(); 
  data.forEach(r => { 
    if (r[q]) set.add(r[q]); 
  }); 
  console.log(`\n--- ${q} ---`); 
  set.forEach(v => console.log(v)); 
});
