const fs = require('fs');
const path = 'c:/Users/USER/Desktop/MediCore/medicore-backend/server.js';
let content = fs.readFileSync(path, 'utf8');

const duplicates = `const Notification = require('./models/Notification');
const Feedback = require('./models/Feedback');
const AuditLog = require('./models/AuditLog');`;

content = content.replace(duplicates, '');

fs.writeFileSync(path, content);
