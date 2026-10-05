const fs = require('fs');
const path = 'c:/Users/USER/Desktop/MediCore/medicorefrontend/src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// Fix the broken one
content = content.replace('className={\\mc-dot \\\\}>', 'className={mc-dot }>');
// Fix any other remaining ones
content = content.replace(/className=\{\\\mc-dot \\\\\\\$\\{sysHealth \? 'green' : 'red'\\}\\\\}/g, 'className={mc-dot }');

// Also fix any remaining badge ones just in case
content = content.replace(/className=\{\\\mc-badge \\\\\\\$\\{u\.status === 'suspended' \? 'badge-suspended' : u\.status === 'pending' \? 'badge-warning' : 'badge-active'\\}\\\\}/g, 'className={mc-badge }');

fs.writeFileSync(path, content);
