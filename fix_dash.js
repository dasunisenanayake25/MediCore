const fs = require('fs');
const path = 'c:/Users/USER/Desktop/MediCore/medicorefrontend/src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace Audit Log
const auditLogHTML = `            <div className="mc-card-list">
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
            </div>`;
content = content.replace(/<div className="mc-card-list">\s*<div className="mc-list-item">\s*<span style=\{\{color: '#64748b', width: '100px'\}\}>09:14 AM<\/span>[\s\S]*?backend pods 4 [\s\S]*? 6<\/strong>\s*<\/div>\s*<\/div>/, auditLogHTML);

// Replace Notifications
const notificationsHTML = `            <div className="mc-card-list lg-list">
              <div className="mc-list-item" style={{background: '#f8fafc'}}>
                <input 
                  type="text" 
                  className="mc-notify-input" 
                  placeholder="Write an announcement..." 
                  value={newAnnouncement}
                  onChange={(e) => setNewAnnouncement(e.target.value)}
                />
                <button className="mc-action-btn primary" onClick={handlePostAnnouncement}>Post</button>
              </div>
              
              {notifications.map(notif => (
                <div className="mc-list-item" key={notif._id}>
                  <div className="mc-item-info">
                    <strong>{notif.title}</strong>
                    <p>Posted on {new Date(notif.createdAt).toLocaleDateString('en-GB')} • {notif.target}</p>
                  </div>
                  <span className={\`mc-badge \${notif.status === 'Expired' ? 'badge-suspended' : 'badge-active'}\`}>
                    {notif.status}
                  </span>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="mc-list-item"><p>No announcements posted yet.</p></div>
              )}
            </div>`;
content = content.replace(/<div className="mc-card-list lg-list">\s*<div className="mc-list-item" style=\{\{background: '#f8fafc'\}\}>\s*<input type="text" className="mc-notify-input" placeholder="Write an announcement\.\.\." \/>[\s\S]*?Expired<\/span>\s*<\/div>\s*<\/div>/, notificationsHTML);

fs.writeFileSync(path, content);
