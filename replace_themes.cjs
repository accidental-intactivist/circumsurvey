const fs = require('fs');
const file = 'c:/work/circumsurvey/circumsurvey/src/explore/styles/tokens.js';
let content = fs.readFileSync(file, 'utf8');

const vaporwaveNew = `  /* ── VAPORWAVE THEME ── */
  [data-theme="vaporwave"][data-mode="dark"] {
    --c-bg: #0d0221;
    --c-bgSoft: #180436;
    --c-bgCard: #23074d;
    --c-bgDeep: #050012;
    --c-text: #00f0ff;
    --c-textBright: #ffffff;
    --c-muted: #ff00a0;
    --c-dim: #9d00ff;
    --c-ghost: #3c126d;
    --c-gold: #fcee09;
    --c-goldBright: #ffffff;
    --c-red: #ff003c;
    --c-orange: #ff5e00;
    --c-yellow: #fcee09;
    --c-green: #00ff41;
    --c-ltBlue: #00f0ff;
    --c-blue: #1a53ff;
    --c-grey: #5a3982;
    --c-purple: #9d00ff;
    --path-intact: #00f0ff;
    --path-circumcised: #ff003c;
    --path-restoring: #fcee09;
    --path-observer: #00ff41;
    --chart-0: #00f0ff; --chart-1: #ff003c; --chart-2: #fcee09; --chart-3: #00ff41; --chart-4: #9d00ff;
    --chart-5: #ff00a0; --chart-6: #1a53ff; --chart-7: #ff5e00; --chart-8: #00ffff; --chart-9: #ff80df;
  }
  
  [data-theme="vaporwave"][data-mode="light"] {
    --c-bg: #f5efff;
    --c-bgSoft: #e9d9ff;
    --c-bgCard: #ffffff;
    --c-bgDeep: #dbc2ff;
    --c-text: #4a148c;
    --c-textBright: #1a0033;
    --c-muted: #00bcd4;
    --c-dim: #00838f;
    --c-ghost: #ce93d8;
    --c-gold: #ffca28;
    --c-goldBright: #ff8f00;
    --c-red: #ff4081;
    --c-orange: #ff6e40;
    --c-yellow: #ffeb3b;
    --c-green: #1de9b6;
    --c-ltBlue: #84ffff;
    --c-blue: #00e5ff;
    --c-grey: #b39ddb;
    --c-purple: #d500f9;
    --path-intact: #00e5ff;
    --path-circumcised: #ff4081;
    --path-restoring: #ffca28;
    --path-observer: #1de9b6;
    --chart-0: #00e5ff; --chart-1: #ff4081; --chart-2: #ffca28; --chart-3: #1de9b6; --chart-4: #d500f9;
    --chart-5: #00bcd4; --chart-6: #ff8f00; --chart-7: #ff6e40; --chart-8: #84ffff; --chart-9: #b39ddb;
  }

`;

const lowerThemes = `  /* ── AMBER THEME ── */
  [data-theme="amber"][data-mode="dark"] {
    --c-bg: #211612;
    --c-bgSoft: #2f211c;
    --c-bgCard: #3c2a23;
    --c-bgDeep: #170e0b;
    --c-text: #ceb175;
    --c-textBright: #f5eedf;
    --c-muted: #c18748;
    --c-dim: #8b5b2c;
    --c-ghost: #4a3227;
    --c-gold: #ceb175;
    --c-goldBright: #e5cc98;
    --c-red: #e54e21;
    --c-orange: #c18748;
    --c-yellow: #ceb175;
    --c-green: #6c8645;
    --c-ltBlue: #5bc4c2;
    --c-blue: #0a9f9d;
    --c-grey: #8d7a64;
    --c-purple: #9c6c84;
    --path-intact: #0a9f9d;
    --path-circumcised: #e54e21;
    --path-restoring: #ceb175;
    --path-observer: #6c8645;
    --chart-0: #ceb175; --chart-1: #e54e21; --chart-2: #0a9f9d; --chart-3: #6c8645; --chart-4: #c18748;
    --chart-5: #9c6c84; --chart-6: #e5cc98; --chart-7: #8d7a64; --chart-8: #5bc4c2; --chart-9: #4a3227;
  }
  [data-theme="amber"][data-mode="light"] {
    --c-bg: #fdf8f0;
    --c-bgSoft: #f4ecd8;
    --c-bgCard: #ffffff;
    --c-bgDeep: #e8dcc4;
    --c-text: #4a3227;
    --c-textBright: #211612;
    --c-muted: #c18748;
    --c-dim: #8b5b2c;
    --c-ghost: #ceb175;
    --c-gold: #c18748;
    --c-goldBright: #e54e21;
    --c-red: #e54e21;
    --c-orange: #c18748;
    --c-yellow: #ceb175;
    --c-green: #6c8645;
    --c-ltBlue: #5bc4c2;
    --c-blue: #0a9f9d;
    --c-grey: #e8dcc4;
    --c-purple: #9c6c84;
    --path-intact: #0a9f9d;
    --path-circumcised: #e54e21;
    --path-restoring: #c18748;
    --path-observer: #6c8645;
    --chart-0: #0a9f9d; --chart-1: #e54e21; --chart-2: #c18748; --chart-3: #6c8645; --chart-4: #ceb175;
    --chart-5: #9c6c84; --chart-6: #e5cc98; --chart-7: #8d7a64; --chart-8: #5bc4c2; --chart-9: #4a3227;
  }

  /* ── PAPER THEME ── */
  [data-theme="paper"][data-mode="dark"] {
    --c-bg: #1e1b18;
    --c-bgSoft: #2a2522;
    --c-bgCard: #36302d;
    --c-bgDeep: #141210;
    --c-text: #dccbc1;
    --c-textBright: #fdfbf7;
    --c-muted: #c38961;
    --c-dim: #9f5630;
    --c-ghost: #79716c;
    --c-gold: #c38961;
    --c-goldBright: #e04b28;
    --c-red: #950404;
    --c-orange: #e04b28;
    --c-yellow: #c38961;
    --c-green: #388f30;
    --c-ltBlue: #00c1c8;
    --c-blue: #007d82;
    --c-grey: #4a3b32;
    --c-purple: #004042;
    --path-intact: #00c1c8;
    --path-circumcised: #e04b28;
    --path-restoring: #c38961;
    --path-observer: #388f30;
    --chart-0: #00c1c8; --chart-1: #e04b28; --chart-2: #c38961; --chart-3: #388f30; --chart-4: #950404;
    --chart-5: #007d82; --chart-6: #9f5630; --chart-7: #dccbc1; --chart-8: #79716c; --chart-9: #004042;
  }
  [data-theme="paper"][data-mode="light"] {
    --c-bg: #fdfbf7;
    --c-bgSoft: #f2efe9;
    --c-bgCard: #ffffff;
    --c-bgDeep: #e5dfd5;
    --c-text: #4a3b32;
    --c-textBright: #2d1f18;
    --c-muted: #c38961;
    --c-dim: #9f5630;
    --c-ghost: #dccbc1;
    --c-gold: #c38961;
    --c-goldBright: #e04b28;
    --c-red: #950404;
    --c-orange: #e04b28;
    --c-yellow: #c38961;
    --c-green: #388f30;
    --c-ltBlue: #00c1c8;
    --c-blue: #007d82;
    --c-grey: #79716c;
    --c-purple: #004042;
    --path-intact: #007d82;
    --path-circumcised: #950404;
    --path-restoring: #c38961;
    --path-observer: #388f30;
    --chart-0: #007d82; --chart-1: #950404; --chart-2: #e04b28; --chart-3: #c38961; --chart-4: #388f30;
    --chart-5: #9f5630; --chart-6: #004042; --chart-7: #0f542f; --chart-8: #79716c; --chart-9: #2d1f18;
  }

  /* ── PUEBLO THEME ── */
  [data-theme="pueblo"][data-mode="dark"] {
    --c-bg: #1f1412;
    --c-bgSoft: #2e1d1b;
    --c-bgCard: #3d2623;
    --c-bgDeep: #120c0a;
    --c-text: #d5a894;
    --c-textBright: #f1d8cc;
    --c-muted: #935340;
    --c-dim: #a76b58;
    --c-ghost: #4f322e;
    --c-gold: #e49544;
    --c-goldBright: #f0b16a;
    --c-red: #b8422f;
    --c-orange: #d3653b;
    --c-yellow: #e49544;
    --c-green: #657a55;
    --c-ltBlue: #5eb3a6;
    --c-blue: #358376;
    --c-grey: #5b4a48;
    --c-purple: #6b4e6b;
    --path-intact: #5eb3a6;
    --path-circumcised: #d3653b;
    --path-restoring: #e49544;
    --path-observer: #657a55;
    --chart-0: #5eb3a6; --chart-1: #d3653b; --chart-2: #e49544; --chart-3: #657a55; --chart-4: #b8422f;
    --chart-5: #6b4e6b; --chart-6: #f0b16a; --chart-7: #a76b58; --chart-8: #358376; --chart-9: #4f322e;
  }
  [data-theme="pueblo"][data-mode="light"] {
    --c-bg: #f5efe6;
    --c-bgSoft: #ebe0d1;
    --c-bgCard: #ffffff;
    --c-bgDeep: #decab5;
    --c-text: #4a3227;
    --c-textBright: #241812;
    --c-muted: #d3653b;
    --c-dim: #b8422f;
    --c-ghost: #d5a894;
    --c-gold: #e49544;
    --c-goldBright: #d3653b;
    --c-red: #b8422f;
    --c-orange: #d3653b;
    --c-yellow: #e49544;
    --c-green: #657a55;
    --c-ltBlue: #5eb3a6;
    --c-blue: #358376;
    --c-grey: #a76b58;
    --c-purple: #6b4e6b;
    --path-intact: #358376;
    --path-circumcised: #b8422f;
    --path-restoring: #d3653b;
    --path-observer: #657a55;
    --chart-0: #358376; --chart-1: #b8422f; --chart-2: #d3653b; --chart-3: #657a55; --chart-4: #e49544;
    --chart-5: #6b4e6b; --chart-6: #935340; --chart-7: #5b4a48; --chart-8: #5eb3a6; --chart-9: #4f322e;
  }

  /* ── BRICK THEME ── */
  [data-theme="brick"][data-mode="dark"] {
    --c-bg: #1a1919;
    --c-bgSoft: #262525;
    --c-bgCard: #333232;
    --c-bgDeep: #111010;
    --c-text: #d9d4d4;
    --c-textBright: #ffffff;
    --c-muted: #b34747;
    --c-dim: #993d3d;
    --c-ghost: #4d4a4a;
    --c-gold: #cc8533;
    --c-goldBright: #e69940;
    --c-red: #d93636;
    --c-orange: #cc5c33;
    --c-yellow: #cc8533;
    --c-green: #478c5c;
    --c-ltBlue: #668c99;
    --c-blue: #407380;
    --c-grey: #666161;
    --c-purple: #734d73;
    --path-intact: #668c99;
    --path-circumcised: #d93636;
    --path-restoring: #cc8533;
    --path-observer: #478c5c;
    --chart-0: #668c99; --chart-1: #d93636; --chart-2: #cc8533; --chart-3: #478c5c; --chart-4: #cc5c33;
    --chart-5: #734d73; --chart-6: #e69940; --chart-7: #b34747; --chart-8: #407380; --chart-9: #4d4a4a;
  }
  [data-theme="brick"][data-mode="light"] {
    --c-bg: #f2f0f0;
    --c-bgSoft: #e6e3e3;
    --c-bgCard: #ffffff;
    --c-bgDeep: #d9d4d4;
    --c-text: #333232;
    --c-textBright: #1a1919;
    --c-muted: #cc5c33;
    --c-dim: #b34747;
    --c-ghost: #b3afaf;
    --c-gold: #cc8533;
    --c-goldBright: #e69940;
    --c-red: #d93636;
    --c-orange: #cc5c33;
    --c-yellow: #cc8533;
    --c-green: #478c5c;
    --c-ltBlue: #668c99;
    --c-blue: #407380;
    --c-grey: #999393;
    --c-purple: #734d73;
    --path-intact: #407380;
    --path-circumcised: #d93636;
    --path-restoring: #cc5c33;
    --path-observer: #478c5c;
    --chart-0: #407380; --chart-1: #d93636; --chart-2: #cc5c33; --chart-3: #478c5c; --chart-4: #b34747;
    --chart-5: #734d73; --chart-6: #cc8533; --chart-7: #993d3d; --chart-8: #668c99; --chart-9: #4d4a4a;
  }

  /* ── MONO THEME ── */
  [data-theme="mono"][data-mode="dark"] {
    --c-bg: #000000;
    --c-bgSoft: #0a0a0a;
    --c-bgCard: #121212;
    --c-bgDeep: #000000;
    --c-text: #8a8a8a;
    --c-textBright: #f4f4f4;
    --c-muted: #666666;
    --c-dim: #444444;
    --c-ghost: #2a2a2a;
    --c-gold: #ffffff;
    --c-goldBright: #ffffff;
    --c-red: #ffffff;
    --c-orange: #ffffff;
    --c-yellow: #ffffff;
    --c-green: #ffffff;
    --c-ltBlue: #ffffff;
    --c-blue: #ffffff;
    --c-grey: #8a8a8a;
    --c-purple: #8a8a8a;
    --path-intact: #ffffff;
    --path-circumcised: #ffffff;
    --path-restoring: #ffffff;
    --path-observer: #ffffff;
    --chart-0: #f4f4f4; --chart-1: #444444; --chart-2: #8a8a8a; --chart-3: #c0c0c0; --chart-4: #222222;
    --chart-5: #666666; --chart-6: #e0e0e0; --chart-7: #555555; --chart-8: #999999; --chart-9: #111111;
  }
  [data-theme="mono"][data-mode="light"] {
    --c-bg: #f4f4f4;
    --c-bgSoft: #e0e0e0;
    --c-bgCard: #ffffff;
    --c-bgDeep: #d4d4d4;
    --c-text: #444444;
    --c-textBright: #111111;
    --c-muted: #8a8a8a;
    --c-dim: #999999;
    --c-ghost: #c0c0c0;
    --c-gold: #111111;
    --c-goldBright: #111111;
    --c-red: #111111;
    --c-orange: #111111;
    --c-yellow: #111111;
    --c-green: #111111;
    --c-ltBlue: #111111;
    --c-blue: #111111;
    --c-grey: #666666;
    --c-purple: #111111;
    --path-intact: #111111;
    --path-circumcised: #111111;
    --path-restoring: #111111;
    --path-observer: #111111;
    --chart-0: #111111; --chart-1: #999999; --chart-2: #555555; --chart-3: #c0c0c0; --chart-4: #e0e0e0;
    --chart-5: #666666; --chart-6: #222222; --chart-7: #8a8a8a; --chart-8: #444444; --chart-9: #f4f4f4;
  }
`;

const vaporwaveStart = content.indexOf('  /* ── VAPORWAVE THEME ── */');
const evergreenStart = content.indexOf('  /* ── EVERGREEN THEME ── */');
content = content.substring(0, vaporwaveStart) + vaporwaveNew + content.substring(evergreenStart);

const lowerStart = content.indexOf('  /* ── 1980s CRT & PBS MOCKUP THEMES ── */');
const lowerEnd = content.indexOf('  /* ── TOMORROW TYPEFACE ── */');
content = content.substring(0, lowerStart) + lowerThemes + content.substring(lowerEnd);

fs.writeFileSync(file, content, 'utf8');
console.log('Update successful!');
