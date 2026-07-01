const fs = require('fs');
const file = 'src/explore/components/SurveyFlowchart.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Import Icons
if (!content.includes('import * as Icons from')) {
  content = content.replace('import { useReport } from \'../contexts/ReportContext\';', 'import { useReport } from \'../contexts/ReportContext\';\nimport * as Icons from \'./Icons\';');
}

// 2. Constants replacements
content = content.replace(/emoji:\s*"📊"/g, 'icon: "BarChart2"');
content = content.replace(/emoji:\s*"👨‍👩‍👦"/g, 'icon: "Users"');
content = content.replace(/emoji:\s*"🕊️"/g, 'icon: "Globe"');
content = content.replace(/emoji:\s*"👁️"/g, 'icon: "Eye"');
content = content.replace(/emoji:\s*"💡"/g, 'icon: "Heart"');
content = content.replace(/emoji:\s*"📝"/g, 'icon: "FileText"');
content = content.replace(/emoji:\s*"⚖️"/g, 'icon: "Scale"');
content = content.replace(/emoji:\s*"🔀"/g, 'icon: "GitBranch"');
content = content.replace(/emoji:\s*"🌍"/g, 'icon: "Globe"');
content = content.replace(/emoji:\s*"📨"/g, 'icon: "MessageSquareText"');
content = content.replace(/emoji:\s*"🟢"/g, 'icon: "Smile"');
content = content.replace(/emoji:\s*"🔵"/g, 'icon: "Activity"');
content = content.replace(/emoji:\s*"🟣"/g, 'icon: "RefreshCw"');
content = content.replace(/emoji:\s*"🟠"/g, 'icon: "Eye"');
content = content.replace(/emoji:\s*"🔴"/g, 'icon: "Sparkles"');
content = content.replace(/emoji:\s*"⚪"/g, 'icon: "Atom"');
content = content.replace(/emoji:\s*"💬"/g, 'icon: "MessageSquareText"');
content = content.replace(/emoji:\s*"🔀"/g, 'icon: "GitBranch"');

// Fix FlowNode emoji
content = content.replace(/emoji="🔀"/g, 'icon="GitBranch"');

// Update variable access from .emoji to .icon
content = content.replace(/\.emoji/g, '.icon');
content = content.replace(/emoji=\{/g, 'icon={');
content = content.replace(/emoji:/g, 'icon:');

// Update FlowNode signature and rendering
content = content.replace(/function FlowNode\(\{ nodeId, title, emoji,/g, 'function FlowNode({ nodeId, title, icon,');

// Replace {emoji} in FlowNode
content = content.replace(
  /<span style=\{\{\s*fontSize:\s*compact\s*\?\s*"1rem"\s*:\s*"1\.2rem"\s*\}\}>\{emoji\}<\/span>/g,
  '<span>{(() => { const IconComp = icon && Icons[icon] ? Icons[icon] : Icons.Info; return <IconComp size={compact ? 16 : 20} color={color || C.text} />; })()}</span>'
);

// Replace {section.icon} / {branch.icon} / {role.icon} renderings
content = content.replace(
  /<span style=\{\{\s*fontSize:\s*"1\.1rem"\s*\}\}>\{branch\.icon\}<\/span>/g,
  '<span style={{ display: "flex", alignItems: "center" }}>{(() => { const IconComp = branch.icon && Icons[branch.icon] ? Icons[branch.icon] : Icons.Info; return <IconComp size={18} color={branch.color || C.text} />; })()}</span>'
);

content = content.replace(
  /<span style=\{\{\s*fontSize:\s*"0\.8rem"\s*\}\}>\{section\.icon\}<\/span>/g,
  '<span style={{ display: "flex", alignItems: "center" }}>{(() => { const IconComp = section.icon && Icons[section.icon] ? Icons[section.icon] : Icons.Info; return <IconComp size={14} color={C.text} />; })()}</span>'
);

content = content.replace(
  /<span style=\{\{\s*fontSize:\s*"0\.9rem",\s*marginTop:\s*"0\.05rem"\s*\}\}>\{role\.icon\}<\/span>/g,
  '<span style={{ display: "flex", alignItems: "center" }}>{(() => { const IconComp = role.icon && Icons[role.icon] ? Icons[role.icon] : Icons.Info; return <IconComp size={16} color={C.text} />; })()}</span>'
);

content = content.replace(
  /<span>\{activeRole\.icon\}<\/span>/g,
  '<span style={{ display: "flex", alignItems: "center" }}>{(() => { const IconComp = activeRole.icon && Icons[activeRole.icon] ? Icons[activeRole.icon] : Icons.Info; return <IconComp size={16} color={C.text} />; })()}</span>'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Done');
