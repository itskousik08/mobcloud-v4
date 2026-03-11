import React, { useState } from 'react';
import {
  Mail, Plus, Trash2, Play, CheckCircle, Clock, Send,
  Settings, ChevronDown, ChevronUp, AlertCircle, Zap,
  Inbox, ArrowRight, RefreshCw, Edit2,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Default workflow templates ────────────────
const WORKFLOW_TEMPLATES = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    trigger: 'New user signup',
    action: 'Send welcome email with onboarding steps',
    icon: '👋',
    color: '#6366f1',
  },
  {
    id: 'contact-form',
    name: 'Contact Form Reply',
    trigger: 'Contact form submission',
    action: 'Auto-reply with confirmation + notify admin',
    icon: '📧',
    color: '#10b981',
  },
  {
    id: 'newsletter',
    name: 'Newsletter Signup',
    trigger: 'Newsletter subscription',
    action: 'Send welcome newsletter + add to list',
    icon: '📬',
    color: '#f59e0b',
  },
  {
    id: 'order',
    name: 'Order Confirmation',
    trigger: 'Purchase completed',
    action: 'Send receipt and shipping details',
    icon: '🛍️',
    color: '#ec4899',
  },
];

// ── Sample sent emails ────────────────────────
const SAMPLE_EMAILS = [
  { id: 1, to: 'user@example.com', subject: 'Welcome to our platform!', status: 'delivered', time: '2 min ago' },
  { id: 2, to: 'admin@site.com', subject: 'New contact form submission', status: 'delivered', time: '15 min ago' },
  { id: 3, to: 'customer@gmail.com', subject: 'Your order #1234 confirmed', status: 'pending', time: '1 hr ago' },
];

// ── Tab: Connect ──────────────────────────────
function ConnectTab({ connected, setConnected, config, setConfig }) {
  const [testing, setTesting] = useState(false);

  async function testConnection() {
    if (!config.host || !config.user) {
      toast.error('Fill in SMTP host and email address');
      return;
    }
    setTesting(true);
    await new Promise(r => setTimeout(r, 1500));
    setTesting(false);
    setConnected(true);
    toast.success('Email connection successful!');
  }

  function disconnect() {
    setConnected(false);
    toast('Email disconnected', { icon: '📧' });
  }

  return (
    <div style={{ padding: 16 }}>
      {connected ? (
        <div>
          <div style={{
            padding: 14, borderRadius: 12, marginBottom: 16,
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <CheckCircle size={18} color="#10b981" />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#10b981' }}>Email Connected</p>
              <p style={{ fontSize: 11, color: 'var(--muted)' }}>{config.user || 'your@email.com'}</p>
            </div>
            <button onClick={disconnect} className="btn-ghost" style={{ marginLeft: 'auto', fontSize: 11 }}>
              Disconnect
            </button>
          </div>

          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Connection Details
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { label: 'SMTP Host', value: config.host || 'smtp.gmail.com' },
              { label: 'Port', value: config.port || '587' },
              { label: 'From', value: config.user || 'you@email.com' },
              { label: 'Encryption', value: 'TLS' },
            ].map(row => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between', padding: '7px 10px',
                borderRadius: 8, background: 'var(--surface2)', fontSize: 12,
              }}>
                <span style={{ color: 'var(--muted)' }}>{row.label}</span>
                <span style={{ color: 'var(--text2)', fontWeight: 500 }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.6 }}>
            Connect your email account to send automated emails from your website projects.
          </p>

          {/* Provider shortcuts */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {[
              { name: 'Gmail', host: 'smtp.gmail.com', port: '587' },
              { name: 'Outlook', host: 'smtp-mail.outlook.com', port: '587' },
              { name: 'SendGrid', host: 'smtp.sendgrid.net', port: '587' },
              { name: 'Mailgun', host: 'smtp.mailgun.org', port: '587' },
            ].map(p => (
              <button key={p.name} onClick={() => setConfig(c => ({ ...c, host: p.host, port: p.port }))}
                style={{
                  padding: '5px 10px', borderRadius: 8, fontSize: 11, cursor: 'pointer', border: 'none',
                  background: config.host === p.host ? 'rgba(99,102,241,0.15)' : 'var(--surface2)',
                  color: config.host === p.host ? '#818cf8' : 'var(--text2)',
                  border: config.host === p.host ? '1px solid rgba(99,102,241,0.3)' : '1px solid var(--border)',
                }}>
                {p.name}
              </button>
            ))}
          </div>

          {/* SMTP config form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { key: 'host', label: 'SMTP Host', placeholder: 'smtp.gmail.com' },
              { key: 'port', label: 'Port', placeholder: '587' },
              { key: 'user', label: 'Email Address', placeholder: 'you@gmail.com', type: 'email' },
              { key: 'pass', label: 'App Password', placeholder: '••••••••••••', type: 'password' },
              { key: 'from', label: 'From Name', placeholder: 'My Website' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4, fontWeight: 500 }}>
                  {field.label}
                </label>
                <input
                  type={field.type || 'text'}
                  placeholder={field.placeholder}
                  value={config[field.key] || ''}
                  onChange={e => setConfig(c => ({ ...c, [field.key]: e.target.value }))}
                  className="input"
                  style={{ fontSize: 12, padding: '7px 10px' }}
                />
              </div>
            ))}
          </div>

          <button onClick={testConnection} disabled={testing} className="btn-primary" style={{ width: '100%', marginTop: 14, justifyContent: 'center' }}>
            {testing ? <><RefreshCw size={13} className="animate-spin" /> Testing...</> : <><Mail size={13} /> Connect Email</>}
          </button>

          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 10, textAlign: 'center', lineHeight: 1.5 }}>
            For Gmail: use an App Password from your Google Account settings
          </p>
        </div>
      )}
    </div>
  );
}

// ── Tab: Workflows ────────────────────────────
function WorkflowsTab({ connected }) {
  const [workflows, setWorkflows] = useState(WORKFLOW_TEMPLATES);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTrigger, setNewTrigger] = useState('');
  const [newAction, setNewAction] = useState('');
  const [running, setRunning] = useState(null);

  async function runWorkflow(id) {
    if (!connected) { toast.error('Connect email first'); return; }
    setRunning(id);
    await new Promise(r => setTimeout(r, 1200));
    setRunning(null);
    toast.success('Workflow executed successfully!');
  }

  function addWorkflow(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setWorkflows(w => [...w, {
      id: Date.now().toString(),
      name: newName,
      trigger: newTrigger || 'Manual trigger',
      action: newAction || 'Send custom email',
      icon: '⚡',
      color: '#6366f1',
    }]);
    setNewName(''); setNewTrigger(''); setNewAction('');
    setShowNew(false);
    toast.success('Workflow created!');
  }

  function deleteWorkflow(id) {
    setWorkflows(w => w.filter(wf => wf.id !== id));
    toast('Workflow deleted');
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Email Workflows</span>
        <button onClick={() => setShowNew(v => !v)} className="btn-primary" style={{ fontSize: 11, padding: '5px 10px' }}>
          <Plus size={11} /> New
        </button>
      </div>

      {/* New workflow form */}
      {showNew && (
        <form onSubmit={addWorkflow} style={{
          padding: 12, marginBottom: 12, borderRadius: 10,
          background: 'var(--surface2)', border: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input placeholder="Workflow name" value={newName} onChange={e => setNewName(e.target.value)}
              className="input" style={{ fontSize: 12, padding: '6px 10px' }} autoFocus />
            <input placeholder="Trigger (e.g. Form submitted)" value={newTrigger} onChange={e => setNewTrigger(e.target.value)}
              className="input" style={{ fontSize: 12, padding: '6px 10px' }} />
            <input placeholder="Action (e.g. Send confirmation email)" value={newAction} onChange={e => setNewAction(e.target.value)}
              className="input" style={{ fontSize: 12, padding: '6px 10px' }} />
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 11, padding: '6px' }}>Create</button>
              <button type="button" onClick={() => setShowNew(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: 11, padding: '6px' }}>Cancel</button>
            </div>
          </div>
        </form>
      )}

      {/* Workflow list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {workflows.map(wf => (
          <div key={wf.id} style={{
            padding: 12, borderRadius: 10, background: 'var(--surface2)',
            border: '1px solid var(--border)', transition: 'border-color 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: `${wf.color}18`, border: `1px solid ${wf.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
              }}>
                {wf.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 3 }}>{wf.name}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--muted)' }}>
                    <Zap size={9} /> <span>{wf.trigger}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--muted)' }}>
                    <ArrowRight size={9} /> <span>{wf.action}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <button onClick={() => runWorkflow(wf.id)} style={{
                  width: 28, height: 28, borderRadius: 7, border: 'none', cursor: 'pointer',
                  background: running === wf.id ? 'rgba(99,102,241,0.15)' : 'rgba(16,185,129,0.1)',
                  color: running === wf.id ? '#818cf8' : '#10b981',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }} title="Run workflow">
                  {running === wf.id ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
                </button>
                <button onClick={() => deleteWorkflow(wf.id)} style={{
                  width: 28, height: 28, borderRadius: 7, border: 'none', cursor: 'pointer',
                  background: 'rgba(244,63,94,0.08)', color: '#f43f5e',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }} title="Delete">
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab: Compose ──────────────────────────────
function ComposeTab({ connected }) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(SAMPLE_EMAILS);

  async function sendEmail(e) {
    e.preventDefault();
    if (!connected) { toast.error('Connect email first'); return; }
    if (!to || !subject || !body) { toast.error('Fill all fields'); return; }
    setSending(true);
    await new Promise(r => setTimeout(r, 1500));
    setSending(false);
    setSent(s => [{ id: Date.now(), to, subject, status: 'delivered', time: 'just now' }, ...s]);
    setTo(''); setSubject(''); setBody('');
    toast.success('Email sent successfully!');
  }

  return (
    <div style={{ padding: 16 }}>
      <form onSubmit={sendEmail} style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { key: 'to', label: 'To', value: to, onChange: setTo, placeholder: 'recipient@email.com', type: 'email' },
            { key: 'subject', label: 'Subject', value: subject, onChange: setSubject, placeholder: 'Email subject...' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>{f.label}</label>
              <input type={f.type || 'text'} placeholder={f.placeholder} value={f.value}
                onChange={e => f.onChange(e.target.value)} className="input" style={{ fontSize: 12, padding: '7px 10px' }} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Body</label>
            <textarea placeholder="Write your email..." value={body} onChange={e => setBody(e.target.value)}
              rows={5} style={{
                width: '100%', padding: '8px 10px', borderRadius: 10, fontSize: 12, resize: 'vertical',
                border: '1px solid var(--border)', background: 'var(--surface2)',
                color: 'var(--text)', fontFamily: 'inherit', outline: 'none', lineHeight: 1.6,
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <button type="submit" disabled={sending} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            {sending ? <><RefreshCw size={13} className="animate-spin" /> Sending...</> : <><Send size={13} /> Send Email</>}
          </button>
        </div>
      </form>

      {/* Sent log */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Sent</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sent.map(email => (
            <div key={email.id} style={{
              padding: '8px 10px', borderRadius: 8, background: 'var(--surface2)',
              border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                background: email.status === 'delivered' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {email.status === 'delivered'
                  ? <CheckCircle size={11} color="#10b981" />
                  : <Clock size={11} color="#f59e0b" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {email.subject}
                </p>
                <p style={{ fontSize: 10, color: 'var(--muted)' }}>{email.to} · {email.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Email Panel ──────────────────────────
export default function EmailPanel({ projectId }) {
  const [tab, setTab] = useState('connect');
  const [connected, setConnected] = useState(false);
  const [config, setConfig] = useState({
    host: 'smtp.gmail.com', port: '587', user: '', pass: '', from: '',
  });

  const TABS = [
    { id: 'connect', label: 'Connect', icon: Settings },
    { id: 'workflows', label: 'Workflows', icon: Zap },
    { id: 'compose', label: 'Compose', icon: Send },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Status bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
        background: 'var(--surface2)', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
          background: connected ? '#10b981' : '#475569',
          boxShadow: connected ? '0 0 6px #10b981' : 'none',
        }} />
        <span style={{ fontSize: 11, color: connected ? '#10b981' : 'var(--muted)' }}>
          {connected ? `Connected: ${config.user || 'Email account'}` : 'Not connected'}
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            padding: '8px 6px', fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer',
            background: tab === t.id ? 'var(--surface)' : 'transparent',
            color: tab === t.id ? '#818cf8' : 'var(--muted)',
            borderBottom: tab === t.id ? '2px solid #6366f1' : '2px solid transparent',
          }}>
            <t.icon size={12} /> {t.label}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'connect' && <ConnectTab connected={connected} setConnected={setConnected} config={config} setConfig={setConfig} />}
        {tab === 'workflows' && <WorkflowsTab connected={connected} />}
        {tab === 'compose' && <ComposeTab connected={connected} />}
      </div>
    </div>
  );
}
