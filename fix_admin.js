const fs = require('fs');
const path = 'c:/Users/USER/Desktop/MediCore/medicorefrontend/src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// Update imports
content = content.replace(
  "import { getUsers, updateUserStatus, getAppointments, getHealth } from '../api';",
  "import { getUsers, updateUserStatus, getAppointments, getHealth, getNotifications, createNotification, getFeedback, getAuditLogs } from '../api';"
);

// Add new states
content = content.replace(
  "const [sysHealth, setSysHealth] = useState(null);",
  "const [sysHealth, setSysHealth] = useState(null);\n  const [notifications, setNotifications] = useState([]);\n  const [feedbacks, setFeedbacks] = useState([]);\n  const [auditLogs, setAuditLogs] = useState([]);\n  const [newAnnouncement, setNewAnnouncement] = useState('');"
);

// Update fetchData
const newFetchData = const fetchData = async () => {
    try {
      const [uData, aData, hData, nData, fData, lData] = await Promise.all([
        getUsers(),
        getAppointments(),
        getHealth().catch(() => null),
        getNotifications().catch(() => []),
        getFeedback().catch(() => []),
        getAuditLogs().catch(() => [])
      ]);
      setUsersList(uData || []);
      setAppointments(aData || []);
      setSysHealth(hData);
      setNotifications(nData || []);
      setFeedbacks(fData || []);
      setAuditLogs(lData || []);
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    }
  };

  const handlePostAnnouncement = async () => {
    if (!newAnnouncement) return;
    try {
      await createNotification({ title: newAnnouncement });
      setNewAnnouncement('');
      fetchData();
    } catch (err) {
      console.error("Failed to post notification", err);
    }
  };;
content = content.replace(/const fetchData = async \(\) => \{[\s\S]*?\};\n/, newFetchData + "\n");

// Replace Feedback
const feedbackHTML = 
            <div className="mc-card-list">
              {feedbacks.length > 0 ? feedbacks.map(fb => (
                <div className="mc-list-item" key={fb._id} style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                  <div style={{marginBottom: '8px'}}>
                    <strong>{fb.patientName}</strong> <span style={{color: '#f59e0b'}}>{'?'.repeat(fb.rating)}{'?'.repeat(5 - fb.rating)}</span>
                  </div>
                  <p style={{margin: 0, color: '#475569'}}>{fb.comment}</p>
                </div>
              )) : (
                <div className="mc-list-item"><p>No feedback available yet.</p></div>
              )}
            </div>;
content = content.replace(/<div className="mc-card-list">[\s\S]*?Booking was quick and the reminder notification was helpful[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, feedbackHTML + "\n          </div>");

// Replace Audit Log
const auditLogHTML = 
            <div className="mc-card-list">
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
content = content.replace(/<div className="mc-card-list">\s*<div className="mc-list-item">\s*<span style=\{\{color: '#64748b', width: '100px'\}\}>09:14 AM<\/span>[\s\S]*?backend pods 4 ? 6<\/strong>\s*<\/div>\s*<\/div>/, auditLogHTML);

// Replace Notifications
const notificationsHTML = 
            <div className="mc-card-list lg-list">
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
                  <span className={\mc-badge \\}>
                    {notif.status}
                  </span>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="mc-list-item"><p>No announcements posted yet.</p></div>
              )}
            </div>;
content = content.replace(/<div className="mc-card-list lg-list">\s*<div className="mc-list-item" style=\{\{background: '#f8fafc'\}\}>\s*<input type="text" className="mc-notify-input" placeholder="Write an announcement\.\.\." \/>[\s\S]*?Expired<\/span>\s*<\/div>\s*<\/div>/, notificationsHTML);

fs.writeFileSync(path, content);
