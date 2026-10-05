const fs = require('fs');
const path = 'c:/Users/USER/Desktop/MediCore/medicore-backend/server.js';
let content = fs.readFileSync(path, 'utf8');

// Add model imports
const imports = `
const Notification = require('./models/Notification');
const Feedback = require('./models/Feedback');
const AuditLog = require('./models/AuditLog');
`;
content = content.replace("const User = require('./models/User');", "const User = require('./models/User');" + imports);

// Add routes before app.listen
const routes = `
// ==========================================
// NEW ADMIN FEATURES: Notifications & Feedback
// ==========================================
app.post('/api/admin/notifications', async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json(notification);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/admin/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/admin/feedback', async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedback);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/admin/audit-logs', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 });
    res.status(200).json(logs);
  } catch (error) { res.status(500).json({ error: error.message }); }
});
`;
content = content.replace("app.listen(PORT, () => console.log(`Server running on port ${PORT}`));", routes + "\napp.listen(PORT, () => console.log(`Server running on port ${PORT}`));");

fs.writeFileSync(path, content);
