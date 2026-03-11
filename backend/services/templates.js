const fs = require('fs-extra');
const path = require('path');

const TEMPLATES = {
  landing: {
    name: 'Startup Landing Page',
    description: 'Modern SaaS landing page with hero, features, and CTA',
    preview: '/templates/landing.png',
    scaffold: async (dir) => {
      fs.writeFileSync(path.join(dir, 'index.html'), LANDING_HTML);
      fs.writeFileSync(path.join(dir, 'style.css'), LANDING_CSS);
      fs.writeFileSync(path.join(dir, 'script.js'), LANDING_JS);
    }
  },
  portfolio: {
    name: 'Portfolio Website',
    description: 'Personal portfolio with about, projects, and contact sections',
    preview: '/templates/portfolio.png',
    scaffold: async (dir) => {
      fs.writeFileSync(path.join(dir, 'index.html'), PORTFOLIO_HTML);
      fs.writeFileSync(path.join(dir, 'style.css'), PORTFOLIO_CSS);
      fs.writeFileSync(path.join(dir, 'script.js'), PORTFOLIO_JS);
    }
  },
  dashboard: {
    name: 'SaaS Dashboard',
    description: 'Admin dashboard with charts, tables, and metrics',
    preview: '/templates/dashboard.png',
    scaffold: async (dir) => {
      fs.writeFileSync(path.join(dir, 'index.html'), DASHBOARD_HTML);
      fs.writeFileSync(path.join(dir, 'style.css'), DASHBOARD_CSS);
      fs.writeFileSync(path.join(dir, 'script.js'), DASHBOARD_JS);
    }
  },
  blog: {
    name: 'Blog Website',
    description: 'Clean blog with posts grid and article layout',
    preview: '/templates/blog.png',
    scaffold: async (dir) => {
      fs.writeFileSync(path.join(dir, 'index.html'), BLOG_HTML);
      fs.writeFileSync(path.join(dir, 'style.css'), BLOG_CSS);
      fs.writeFileSync(path.join(dir, 'script.js'), BLOG_JS);
    }
  }
};

const LANDING_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Startup - Build Something Amazing</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <nav class="navbar">
    <div class="nav-brand">⚡ Startup</div>
    <div class="nav-links">
      <a href="#features">Features</a>
      <a href="#pricing">Pricing</a>
      <a href="#about">About</a>
      <a href="#" class="btn-nav">Get Started</a>
    </div>
  </nav>
  <main>
    <section class="hero">
      <div class="hero-badge">🚀 Now in Beta</div>
      <h1 class="hero-title">Build the future<br><span class="gradient-text">faster than ever</span></h1>
      <p class="hero-subtitle">The AI-powered platform that helps teams ship products 10x faster with intelligent automation and real-time collaboration.</p>
      <div class="hero-cta">
        <a href="#" class="btn-primary">Start for free</a>
        <a href="#" class="btn-secondary">Watch demo →</a>
      </div>
      <div class="hero-stats">
        <div class="stat"><span class="stat-num">50K+</span><span class="stat-label">Teams</span></div>
        <div class="stat"><span class="stat-num">99.9%</span><span class="stat-label">Uptime</span></div>
        <div class="stat"><span class="stat-num">10x</span><span class="stat-label">Faster</span></div>
      </div>
    </section>
    <section id="features" class="features">
      <div class="section-header">
        <span class="section-badge">Features</span>
        <h2>Everything you need to ship</h2>
      </div>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">⚡</div>
          <h3>Lightning Fast</h3>
          <p>Deploy in seconds with our optimized infrastructure and global CDN.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🤖</div>
          <h3>AI Powered</h3>
          <p>Intelligent code suggestions and automated testing save you hours.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔒</div>
          <h3>Enterprise Security</h3>
          <p>SOC2 compliant with end-to-end encryption and audit logs.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🌐</div>
          <h3>Global Scale</h3>
          <p>Auto-scaling infrastructure that handles millions of users.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔧</div>
          <h3>Dev Tools</h3>
          <p>Powerful CLI, APIs, and integrations with your existing stack.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <h3>Analytics</h3>
          <p>Real-time dashboards and actionable insights for your team.</p>
        </div>
      </div>
    </section>
    <section class="cta-section">
      <h2>Ready to ship faster?</h2>
      <p>Join 50,000+ teams already using our platform.</p>
      <a href="#" class="btn-primary">Get started free</a>
    </section>
  </main>
  <footer>
    <p>© 2024 Startup. Built with ❤️ using Mobclowd.</p>
  </footer>
  <script src="script.js"></script>
</body>
</html>`;

const LANDING_CSS = `*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#020209;--surface:#0d0d1a;--border:#1e1e3a;--accent:#6366f1;--accent2:#8b5cf6;--text:#e2e8f0;--muted:#64748b}
body{font-family:'Segoe UI',system-ui,sans-serif;background:var(--bg);color:var(--text);overflow-x:hidden}
.navbar{position:fixed;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;padding:1rem 2rem;background:rgba(2,2,9,0.8);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);z-index:100}
.nav-brand{font-size:1.25rem;font-weight:700;color:#fff}
.nav-links{display:flex;align-items:center;gap:2rem}
.nav-links a{color:var(--muted);text-decoration:none;transition:.2s}
.nav-links a:hover{color:var(--text)}
.btn-nav{background:var(--accent);color:#fff!important;padding:.5rem 1.25rem;border-radius:8px}
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:6rem 2rem 4rem;position:relative}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(99,102,241,.15) 0%,transparent 70%)}
.hero-badge{background:rgba(99,102,241,.15);border:1px solid rgba(99,102,241,.3);color:var(--accent);padding:.4rem 1rem;border-radius:100px;font-size:.875rem;margin-bottom:2rem;display:inline-block}
.hero-title{font-size:clamp(2.5rem,8vw,5rem);font-weight:800;line-height:1.1;margin-bottom:1.5rem;letter-spacing:-.02em}
.gradient-text{background:linear-gradient(135deg,var(--accent),var(--accent2),#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero-subtitle{max-width:600px;color:var(--muted);font-size:1.125rem;line-height:1.7;margin-bottom:2.5rem}
.hero-cta{display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;margin-bottom:4rem}
.btn-primary{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;padding:.875rem 2rem;border-radius:12px;text-decoration:none;font-weight:600;transition:.2s;box-shadow:0 0 30px rgba(99,102,241,.3)}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 0 50px rgba(99,102,241,.5)}
.btn-secondary{color:var(--text);padding:.875rem 2rem;border-radius:12px;text-decoration:none;font-weight:500;border:1px solid var(--border)}
.btn-secondary:hover{border-color:var(--accent)}
.hero-stats{display:flex;gap:3rem;flex-wrap:wrap;justify-content:center}
.stat{text-align:center}
.stat-num{display:block;font-size:2rem;font-weight:700;color:#fff}
.stat-label{color:var(--muted);font-size:.875rem}
.features{padding:6rem 2rem;max-width:1200px;margin:0 auto}
.section-header{text-align:center;margin-bottom:4rem}
.section-badge{background:rgba(99,102,241,.1);color:var(--accent);padding:.4rem 1rem;border-radius:100px;font-size:.875rem;border:1px solid rgba(99,102,241,.2)}
.section-header h2{font-size:2.5rem;font-weight:700;margin-top:1rem}
.features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem}
.feature-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:2rem;transition:.2s}
.feature-card:hover{border-color:var(--accent);transform:translateY(-4px)}
.feature-icon{font-size:2rem;margin-bottom:1rem}
.feature-card h3{font-size:1.125rem;font-weight:600;margin-bottom:.75rem}
.feature-card p{color:var(--muted);line-height:1.6}
.cta-section{text-align:center;padding:6rem 2rem;background:linear-gradient(135deg,rgba(99,102,241,.1),rgba(139,92,246,.05));border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.cta-section h2{font-size:2.5rem;font-weight:700;margin-bottom:1rem}
.cta-section p{color:var(--muted);margin-bottom:2rem}
footer{text-align:center;padding:2rem;color:var(--muted);font-size:.875rem}`;

const LANDING_JS = `// Scroll animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity .6s, transform .6s';
  observer.observe(el);
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  navbar.style.background = window.scrollY > 50
    ? 'rgba(2,2,9,0.95)' : 'rgba(2,2,9,0.8)';
});`;

const PORTFOLIO_HTML = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>John Doe - Developer</title><link rel="stylesheet" href="style.css"></head>
<body>
<nav class="nav"><span class="logo">JD.</span><div class="links"><a href="#about">About</a><a href="#work">Work</a><a href="#contact">Contact</a></div></nav>
<section class="hero"><div class="hero-content"><p class="greeting">Hello, I'm</p><h1>John Doe</h1><p class="role">Full Stack Developer & Designer</p><p class="bio">I build beautiful, performant web experiences with modern technologies.</p><div class="cta"><a href="#work" class="btn">View Work</a><a href="#contact" class="btn-outline">Let's Talk</a></div></div></section>
<section id="work" class="work"><h2 class="section-title">Selected Work</h2><div class="projects-grid"><div class="project-card"><div class="project-img">🌐</div><div class="project-info"><h3>E-Commerce Platform</h3><p>Full-stack store with React & Node.js</p><div class="tags"><span>React</span><span>Node.js</span><span>MongoDB</span></div></div></div><div class="project-card"><div class="project-img">📱</div><div class="project-info"><h3>Mobile Banking App</h3><p>Fintech app with real-time data</p><div class="tags"><span>React Native</span><span>GraphQL</span></div></div></div><div class="project-card"><div class="project-img">🤖</div><div class="project-info"><h3>AI Dashboard</h3><p>ML model monitoring platform</p><div class="tags"><span>Python</span><span>TensorFlow</span><span>Vue</span></div></div></div></div></section>
<section id="contact" class="contact"><h2>Let's Work Together</h2><p>Available for freelance projects and full-time opportunities.</p><a href="mailto:hello@example.com" class="btn">Send Message</a></section>
<script src="script.js"></script>
</body></html>`;

const PORTFOLIO_CSS = `*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;background:#050510;color:#e2e8f0;overflow-x:hidden}
.nav{position:fixed;top:0;width:100%;display:flex;justify-content:space-between;align-items:center;padding:1.5rem 4rem;backdrop-filter:blur(20px);z-index:100;border-bottom:1px solid rgba(255,255,255,.05)}
.logo{font-size:1.5rem;font-weight:800;background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.links{display:flex;gap:2.5rem}.links a{color:#94a3b8;text-decoration:none;transition:.2s}.links a:hover{color:#fff}
.hero{min-height:100vh;display:flex;align-items:center;padding:0 4rem;position:relative}
.hero::before{content:'';position:absolute;top:20%;right:10%;width:400px;height:400px;background:radial-gradient(circle,rgba(99,102,241,.2),transparent);border-radius:50%}
.greeting{color:#818cf8;font-size:1rem;letter-spacing:.2em;text-transform:uppercase;margin-bottom:.5rem}
h1{font-size:5rem;font-weight:900;line-height:1;letter-spacing:-.04em;margin-bottom:.5rem}
.role{font-size:1.5rem;color:#94a3b8;margin-bottom:1.5rem}
.bio{max-width:480px;color:#64748b;line-height:1.8;margin-bottom:2.5rem}
.cta{display:flex;gap:1rem}
.btn{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:.875rem 2rem;border-radius:10px;text-decoration:none;font-weight:600}
.btn-outline{border:1px solid rgba(255,255,255,.1);color:#e2e8f0;padding:.875rem 2rem;border-radius:10px;text-decoration:none}
.work{padding:8rem 4rem;max-width:1200px;margin:0 auto}
.section-title{font-size:2rem;font-weight:700;margin-bottom:3rem;position:relative}
.section-title::after{content:'';position:absolute;bottom:-8px;left:0;width:60px;height:3px;background:linear-gradient(135deg,#6366f1,#8b5cf6)}
.projects-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem}
.project-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:16px;overflow:hidden;transition:.3s;cursor:pointer}
.project-card:hover{border-color:rgba(99,102,241,.4);transform:translateY(-8px)}
.project-img{height:180px;display:flex;align-items:center;justify-content:center;font-size:4rem;background:linear-gradient(135deg,rgba(99,102,241,.1),rgba(139,92,246,.05))}
.project-info{padding:1.5rem}
.project-info h3{font-size:1.125rem;font-weight:600;margin-bottom:.5rem}
.project-info p{color:#64748b;font-size:.875rem;margin-bottom:1rem}
.tags{display:flex;gap:.5rem;flex-wrap:wrap}
.tags span{background:rgba(99,102,241,.1);color:#818cf8;padding:.2rem .75rem;border-radius:100px;font-size:.75rem;border:1px solid rgba(99,102,241,.2)}
.contact{text-align:center;padding:8rem 2rem}
.contact h2{font-size:3rem;font-weight:700;margin-bottom:1rem}
.contact p{color:#64748b;margin-bottom:2rem}`;

const PORTFOLIO_JS = `document.querySelectorAll('.project-card').forEach((card, i) => {
  card.style.animationDelay = i * 0.1 + 's';
});`;

const DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SaaS Dashboard</title><link rel="stylesheet" href="style.css"></head>
<body>
<div class="app">
<aside class="sidebar">
  <div class="sidebar-logo">⚡ Dash</div>
  <nav class="sidebar-nav">
    <a href="#" class="nav-item active">📊 Overview</a>
    <a href="#" class="nav-item">📈 Analytics</a>
    <a href="#" class="nav-item">👥 Users</a>
    <a href="#" class="nav-item">📦 Products</a>
    <a href="#" class="nav-item">💳 Billing</a>
    <a href="#" class="nav-item">⚙️ Settings</a>
  </nav>
</aside>
<main class="main">
  <header class="topbar">
    <h1 class="page-title">Dashboard Overview</h1>
    <div class="topbar-actions"><input type="text" placeholder="Search..." class="search"><div class="avatar">JD</div></div>
  </header>
  <div class="content">
    <div class="metrics-grid">
      <div class="metric-card"><div class="metric-label">Total Revenue</div><div class="metric-value">$128,430</div><div class="metric-change positive">+12.5%</div></div>
      <div class="metric-card"><div class="metric-label">Active Users</div><div class="metric-value">8,249</div><div class="metric-change positive">+8.1%</div></div>
      <div class="metric-card"><div class="metric-label">Conversions</div><div class="metric-value">3.24%</div><div class="metric-change negative">-0.4%</div></div>
      <div class="metric-card"><div class="metric-label">Avg. Session</div><div class="metric-value">4m 32s</div><div class="metric-change positive">+22%</div></div>
    </div>
    <div class="charts-row">
      <div class="chart-card"><h3>Revenue Trend</h3><div class="chart-placeholder" id="revenue-chart"></div></div>
      <div class="chart-card small"><h3>Traffic Sources</h3><div class="donut-chart" id="donut"></div></div>
    </div>
    <div class="table-card"><h3>Recent Orders</h3><table><thead><tr><th>Customer</th><th>Product</th><th>Amount</th><th>Status</th></tr></thead><tbody><tr><td>Alice M.</td><td>Pro Plan</td><td>$99</td><td><span class="badge success">Paid</span></td></tr><tr><td>Bob K.</td><td>Starter</td><td>$29</td><td><span class="badge success">Paid</span></td></tr><tr><td>Carol R.</td><td>Enterprise</td><td>$499</td><td><span class="badge pending">Pending</span></td></tr></tbody></table></div>
  </div>
</main>
</div>
<script src="script.js"></script>
</body></html>`;

const DASHBOARD_CSS = `*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;background:#050510;color:#e2e8f0}
.app{display:flex;min-height:100vh}
.sidebar{width:240px;background:#0a0a18;border-right:1px solid #1a1a2e;padding:1.5rem;display:flex;flex-direction:column;gap:2rem;flex-shrink:0}
.sidebar-logo{font-size:1.25rem;font-weight:700;color:#818cf8}
.sidebar-nav{display:flex;flex-direction:column;gap:.25rem}
.nav-item{display:block;padding:.75rem 1rem;border-radius:10px;color:#64748b;text-decoration:none;font-size:.875rem;transition:.2s}
.nav-item:hover,.nav-item.active{background:rgba(99,102,241,.1);color:#818cf8}
.main{flex:1;display:flex;flex-direction:column}
.topbar{display:flex;justify-content:space-between;align-items:center;padding:1.5rem 2rem;border-bottom:1px solid #1a1a2e}
.page-title{font-size:1.25rem;font-weight:600}
.topbar-actions{display:flex;align-items:center;gap:1rem}
.search{background:#0d0d1a;border:1px solid #1e1e3a;color:#e2e8f0;padding:.5rem 1rem;border-radius:8px;outline:none}
.avatar{width:36px;height:36px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;cursor:pointer}
.content{padding:2rem;display:flex;flex-direction:column;gap:1.5rem}
.metrics-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}
.metric-card{background:#0a0a18;border:1px solid #1a1a2e;border-radius:12px;padding:1.5rem}
.metric-label{color:#64748b;font-size:.8125rem;margin-bottom:.5rem}
.metric-value{font-size:1.75rem;font-weight:700;margin-bottom:.25rem}
.metric-change{font-size:.8125rem}.positive{color:#10b981}.negative{color:#f43f5e}
.charts-row{display:grid;grid-template-columns:1fr 300px;gap:1rem}
.chart-card{background:#0a0a18;border:1px solid #1a1a2e;border-radius:12px;padding:1.5rem}
.chart-card h3{font-size:.9375rem;font-weight:600;margin-bottom:1rem}
.chart-placeholder{height:200px;background:linear-gradient(135deg,rgba(99,102,241,.05),rgba(139,92,246,.03));border-radius:8px;position:relative;overflow:hidden}
.table-card{background:#0a0a18;border:1px solid #1a1a2e;border-radius:12px;padding:1.5rem}
.table-card h3{margin-bottom:1rem;font-size:.9375rem;font-weight:600}
table{width:100%;border-collapse:collapse}
th,td{padding:.75rem;text-align:left;border-bottom:1px solid #1a1a2e}
th{color:#64748b;font-size:.8125rem;font-weight:500}
td{font-size:.875rem}
.badge{padding:.25rem .75rem;border-radius:100px;font-size:.75rem}
.success{background:rgba(16,185,129,.1);color:#10b981}
.pending{background:rgba(245,158,11,.1);color:#f59e0b}`;

const DASHBOARD_JS = `// Animate metrics
document.querySelectorAll('.metric-value').forEach(el => {
  el.style.opacity = '0'; 
  setTimeout(() => { el.style.transition = '.5s'; el.style.opacity = '1'; }, 100);
});

// Draw simple bar chart
const canvas = document.createElement('canvas');
const chart = document.getElementById('revenue-chart');
if (chart) {
  chart.appendChild(canvas);
  canvas.width = chart.offsetWidth;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  const data = [65,80,72,95,88,120,115,130,125,140,135,150];
  const max = Math.max(...data);
  const barW = canvas.width / data.length - 6;
  data.forEach((v, i) => {
    const h = (v / max) * 160;
    const x = i * (barW + 6) + 3;
    const y = 180 - h;
    ctx.fillStyle = \`rgba(99,102,241,\${0.4 + (i/data.length)*0.6})\`;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, h, [4]);
    ctx.fill();
  });
}`;

const BLOG_HTML = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>The Blog</title><link rel="stylesheet" href="style.css"></head>
<body>
<nav class="nav"><a class="logo" href="#">✍️ The Blog</a><div class="links"><a href="#">Articles</a><a href="#">Topics</a><a href="#">About</a><a href="#" class="subscribe">Subscribe</a></div></nav>
<main>
<section class="blog-hero"><span class="tag">Latest</span><h1>Thoughts on tech, design, and the future</h1><p>Long-form writing on software development, design systems, and building great products.</p></section>
<div class="posts-grid">
  <article class="post-card featured"><div class="post-tag">Featured</div><h2>The Future of AI-Assisted Development</h2><p>How AI tools are fundamentally changing the way developers write, review, and ship code in 2024.</p><div class="post-meta"><span class="author">Sarah Chen</span><span class="date">Dec 15, 2024</span><span class="read-time">8 min read</span></div></article>
  <article class="post-card"><h2>Building Design Systems at Scale</h2><p>Lessons learned from building component libraries used by 100+ engineers.</p><div class="post-meta"><span>Alex R.</span><span>Dec 12</span><span>5 min</span></div></article>
  <article class="post-card"><h2>Why TypeScript Won</h2><p>The gradual adoption of static typing in the JavaScript ecosystem.</p><div class="post-meta"><span>Mike D.</span><span>Dec 10</span><span>7 min</span></div></article>
  <article class="post-card"><h2>CSS Grid vs Flexbox in 2024</h2><p>When to use each layout method and why the choice matters.</p><div class="post-meta"><span>Emma L.</span><span>Dec 8</span><span>4 min</span></div></article>
</div>
</main>
<script src="script.js"></script>
</body></html>`;

const BLOG_CSS = `*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Georgia,serif;background:#fafaf8;color:#1a1a1a}
.nav{display:flex;justify-content:space-between;align-items:center;padding:1.5rem 4rem;border-bottom:1px solid #e5e5e0}
.logo{font-size:1.25rem;font-weight:700;text-decoration:none;color:#1a1a1a}
.links{display:flex;gap:2rem;align-items:center}
.links a{color:#6b6b6b;text-decoration:none;font-family:'Segoe UI',sans-serif;font-size:.9375rem}
.subscribe{background:#1a1a1a;color:#fff!important;padding:.5rem 1.25rem;border-radius:100px}
.blog-hero{max-width:700px;margin:4rem auto;padding:0 2rem;text-align:center}
.tag{background:#f0e6ff;color:#7c3aed;padding:.3rem 1rem;border-radius:100px;font-family:'Segoe UI',sans-serif;font-size:.8125rem;display:inline-block;margin-bottom:1.5rem}
.blog-hero h1{font-size:2.5rem;line-height:1.3;margin-bottom:1rem;color:#1a1a1a}
.blog-hero p{color:#6b6b6b;font-size:1.125rem;line-height:1.7}
.posts-grid{max-width:1100px;margin:3rem auto;padding:0 2rem;display:grid;grid-template-columns:1fr 1fr;gap:2rem}
.post-card{background:#fff;border:1px solid #e5e5e0;border-radius:12px;padding:2rem;transition:.2s;cursor:pointer;position:relative}
.post-card:hover{box-shadow:0 8px 30px rgba(0,0,0,.08);transform:translateY(-2px)}
.post-card.featured{grid-column:span 2;background:linear-gradient(135deg,#fdf4ff,#fff);border-color:#ddd6fe}
.post-tag{background:#7c3aed;color:#fff;font-family:'Segoe UI',sans-serif;font-size:.75rem;padding:.3rem .75rem;border-radius:100px;display:inline-block;margin-bottom:1rem}
.post-card h2{font-size:1.375rem;line-height:1.4;margin-bottom:.75rem;color:#1a1a1a}
.post-card.featured h2{font-size:1.75rem}
.post-card p{color:#6b6b6b;line-height:1.7;margin-bottom:1.5rem;font-size:.9375rem}
.post-meta{display:flex;gap:1rem;color:#9ca3af;font-family:'Segoe UI',sans-serif;font-size:.8125rem}`;

const BLOG_JS = `document.querySelectorAll('.post-card').forEach(card => {
  card.addEventListener('click', () => {
    card.style.transform = 'scale(0.98)';
    setTimeout(() => card.style.transform = '', 150);
  });
});`;

const TEMPLATES_LIST = Object.entries(TEMPLATES).map(([id, t]) => ({
  id,
  name: t.name,
  description: t.description
}));

module.exports = { TEMPLATES, TEMPLATES_LIST };
