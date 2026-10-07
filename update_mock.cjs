const fs = require('fs');
const path = 'c:\\work\\circumsurvey\\advocacy-shell\\public\\api_collections_umass-ms-1205_mock.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

data.collection.title = "Tim Hammond Genital Autonomy Archive";
data.collection.subtitle = "Call no.: MS 1205 (1971-2023, 5 boxes, 8 linear feet)";
data.collection.description = "Tim Hammond's pioneering contributions to the genital autonomy movement began in 1989 with the co-founding of the National Organization of Restoring Men and includes founding NOHARMM, producing \"Whose Body, Whose Rights?\", publishing two large scale circumcision harm documentation surveys and a survey of 1,800 foreskin restorers, serving as webmaster for the Global Survey of Circumcision Harm, and continuing his critical work through GALDEF. This digital archive is the representation of the physical collection housed at UMass Amherst.";
data.collection.institution = "University of Massachusetts Amherst";
data.collection.curator = "Robert S. Cox Special Collections and University Archives Research Center";

fs.writeFileSync(path, JSON.stringify(data));
console.log('Updated mock JSON successfully!');
