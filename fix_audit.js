const fs = require('fs');
const path = 'c:/Users/USER/Desktop/MediCore/medicorefrontend/src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace Audit Log
const auditLogHTML =             <div className="mc-card-list">
              {auditLogs.length > 0 ? auditLogs.map(log => (
                <div className="mc-list-item" key={log._id}>
                  <span style={{color: '#64748b', width: '120px'}}>
                    {new Date(log.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </span>
                  <strong style={{flex: 1, color: '#0f172a'}}>{log.action}</strong>
                </div>
              )) : (
                <div className="mc-list-item"><p>No audit logs available.</p></div>
              )}
            </div>;
content = content.replace(/<div className="mc-card-list">\s*<div className="mc-list-item">\s*<span style=\{\{color: '#64748b', width: '100px'\}\}>09:14 AM<\/span>[\s\S]*?backend pods 4 [\s\S]*? 6<\/strong>\s*<\/div>\s*<\/div>/, auditLogHTML);

fs.writeFileSync(path, content);
