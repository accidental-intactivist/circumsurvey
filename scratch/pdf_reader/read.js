const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'D:\\Dropbox\\Accidental Intactivist\\The Accidental Intactivist Manifesto.pdf';

let dataBuffer = fs.readFileSync(pdfPath);

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('manifesto.txt', data.text);
    console.log("PDF successfully extracted to manifesto.txt");
}).catch(function(error) {
    console.error("Error extracting PDF:", error);
});
