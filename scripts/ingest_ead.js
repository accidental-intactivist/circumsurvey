import fs from 'fs';
import { parseStringPromise } from 'xml2js';

async function generateSQL() {
  console.log("Fetching EAD XML from UMass...");
  const res = await fetch("http://findingaids.library.umass.edu/ead/mums1205.xml");
  const xml = await res.text();
  
  console.log("Parsing XML...");
  const result = await parseStringPromise(xml);
  const dsc = result.ead.archdesc[0].dsc[0];
  
  let sql = `
-- Auto-generated from UMass EAD XML
DELETE FROM physical_inventory;
`;

  let itemCount = 0;
  let idCounter = 1;

  // The collection has series as c01
  const seriesList = dsc.c01 || [];
  for (const series of seriesList) {
    const seriesTitleRaw = series.did?.[0]?.unittitle?.[0];
    const seriesTitle = typeof seriesTitleRaw === 'object' ? seriesTitleRaw._ : seriesTitleRaw;
    
    const files = series.c02 || [];
    for (const file of files) {
      const did = file.did?.[0];
      if (!did) continue;

      const unittitleRaw = did.unittitle?.[0];
      const titleRaw = typeof unittitleRaw === 'object' ? unittitleRaw._ : unittitleRaw;
      const title = titleRaw || 'Untitled Folder';
      
      const unitdateRaw = did.unitdate?.[0];
      const date = typeof unitdateRaw === 'object' ? unitdateRaw._ : unitdateRaw;
      
      let box = '';
      let folder = '';
      const containers = did.container || [];
      for (const c of containers) {
        if (c.$.type === 'box') box = c._;
        if (c.$.type === 'folder') folder = c._;
      }

      const scopeRaw = file.scopecontent?.[0]?.p?.[0];
      const desc = typeof scopeRaw === 'object' ? scopeRaw._ : scopeRaw;

      // Escape quotes for SQL
      const escape = (str) => {
        if (!str) return 'NULL';
        return "'" + str.toString().replace(/'/g, "''") + "'";
      };

      sql += `INSERT INTO physical_inventory (id, series_title, box_number, folder_number, item_title, item_date, description) VALUES (`;
      sql += `'ead_item_${idCounter++}', ${escape(seriesTitle)}, ${escape(box)}, ${escape(folder)}, ${escape(title)}, ${escape(date)}, ${escape(desc)});\n`;
      itemCount++;
    }
  }

  fs.writeFileSync('ead_seed.sql', sql);
  console.log(`Successfully generated ead_seed.sql with ${itemCount} items.`);
}

generateSQL().catch(console.error);
