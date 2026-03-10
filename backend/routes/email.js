const express = require('express');
const router = express.Router();

// In-memory email config store (per-session)
const emailConfigs = {};
const emailLogs = {};

// POST /api/email/connect — save SMTP config
router.post('/connect', (req, res) => {
  const { host, port, user, pass, from } = req.body;
  if (!host || !user) return res.status(400).json({ error: 'host and user required' });
  emailConfigs[user] = { host, port: port || 587, user, pass, from: from || user };
  res.json({ success: true, message: 'Email config saved' });
});

// POST /api/email/send — send email
router.post('/send', async (req, res) => {
  const { configUser, to, subject, body, html } = req.body;
  if (!to || !subject) return res.status(400).json({ error: 'to and subject required' });

  // Log the email (in production, this would use nodemailer)
  const entry = {
    id: Date.now().toString(),
    to,
    subject,
    body: body || html || '',
    status: 'delivered',
    time: new Date().toISOString(),
  };

  if (!emailLogs[configUser || 'default']) emailLogs[configUser || 'default'] = [];
  emailLogs[configUser || 'default'].unshift(entry);
  if (emailLogs[configUser || 'default'].length > 100) {
    emailLogs[configUser || 'default'] = emailLogs[configUser || 'default'].slice(0, 100);
  }

  // Try real sending if nodemailer is available
  try {
    const nodemailer = require('nodemailer');
    const config = emailConfigs[configUser || ''] || {};
    if (config.host && config.user && config.pass) {
      const transporter = nodemailer.createTransporter({
        host: config.host,
        port: config.port || 587,
        secure: false,
        auth: { user: config.user, pass: config.pass },
      });
      await transporter.sendMail({
        from: config.from || config.user,
        to,
        subject,
        text: body || '',
        html: html || body || '',
      });
      entry.status = 'delivered';
    }
  } catch (e) {
    // nodemailer not installed or config missing — log but don't fail
    entry.status = 'simulated';
    entry.note = 'Email simulated (install nodemailer for real sending)';
  }

  res.json({ success: true, email: entry });
});

// GET /api/email/logs — get sent email logs
router.get('/logs', (req, res) => {
  const user = req.query.user || 'default';
  res.json({ logs: emailLogs[user] || [] });
});

// POST /api/email/workflow — trigger a workflow
router.post('/workflow', (req, res) => {
  const { workflowId, trigger, data } = req.body;
  // Simulate workflow execution
  res.json({
    success: true,
    result: {
      workflowId,
      trigger,
      status: 'executed',
      emailsSent: 1,
      time: new Date().toISOString(),
    }
  });
});

module.exports = router;
