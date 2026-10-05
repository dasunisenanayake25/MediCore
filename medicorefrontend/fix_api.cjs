const fs = require('fs');
const path = 'c:/Users/USER/Desktop/MediCore/medicorefrontend/src/api.js';
let content = fs.readFileSync(path, 'utf8');

// Just slice out everything after the first export of getNotifications
const idx = content.indexOf('export const getNotifications');
if (idx > 0) {
    content = content.substring(0, idx);
}
content += `// --- NEW ADMIN API CALLS ---
export const getNotifications = async () => {
  const response = await API.get('/admin/notifications');
  return response.data;
};

export const createNotification = async (data) => {
  const response = await API.post('/admin/notifications', data);
  return response.data;
};

export const getFeedback = async () => {
  const response = await API.get('/admin/feedback');
  return response.data;
};

export const getAuditLogs = async () => {
  const response = await API.get('/admin/audit-logs');
  return response.data;
};
`;
fs.writeFileSync(path, content);
