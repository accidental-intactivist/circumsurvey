const rawAnswer = `
The data will not be used.

<SUA>Normal Question</SUA>
<UA>Broken tag<SUA>
<SUA>Another normal</SUA>
`;

const suggestions = [];
const suaRegex = /<S?UA>\s*(.*?)\s*(?:<\/?S?UA>|$)/gi;

let match;
let answer = rawAnswer;
while ((match = suaRegex.exec(rawAnswer)) !== null) {
  if (match[1].trim()) suggestions.push(match[1].trim());
}

answer = rawAnswer.replace(/<S?UA>\s*(.*?)\s*(?:<\/?S?UA>|$)/gi, "").trim();

console.log("Suggestions:", suggestions);
console.log("Answer:", answer);
