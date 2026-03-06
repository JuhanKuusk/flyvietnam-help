# FlyVietnam.Help - Namecheap Deployment Guide

## Variant B: Eraldi Server Namecheap IP-l

### Eeltingimused
- Namecheap VPS või Dedicated Server eraldi IP-aadressiga
- Node.js 20+ installeeritud serveris
- PM2 protsessihaldur
- Nginx reverse proxy
- SSL sertifikaat (Let's Encrypt)

---

## 1. Serveri Ettevalmistus

### 1.1 SSH ühendus serveriga
```bash
ssh root@YOUR_NAMECHEAP_IP
```

### 1.2 Node.js ja PM2 installeerimine
```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 protsessihaldur
npm install -g pm2
```

### 1.3 Nginx installeerimine
```bash
sudo apt update
sudo apt install nginx -y
```

---

## 2. Projekti Ülespanek

### 2.1 Projekti kloonimine/kopeerimine serverisse
```bash
# Loo kaust
mkdir -p /var/www/flyvietnam.help
cd /var/www/flyvietnam.help

# Kopeeri failid (kasuta scp või git clone)
# scp -r /path/to/project/* root@YOUR_IP:/var/www/flyvietnam.help/
```

### 2.2 Sõltuvuste installeerimine ja ehitamine
```bash
cd /var/www/flyvietnam.help
npm install
npm run build
```

### 2.3 Environment Variables (.env.local)
Loo `/var/www/flyvietnam.help/.env.local`:
```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Email
RESEND_API_KEY=your_resend_api_key

# WhatsApp/Bird
BIRD_API_KEY=your_bird_api_key
BIRD_WORKSPACE_ID=your_workspace_id
BIRD_CHANNEL_ID=your_channel_id

# Domain
NEXT_PUBLIC_SITE_URL=https://flyvietnam.help
```

---

## 3. PM2 Konfiguratsioon

### 3.1 Loo PM2 ecosystem fail
Loo `/var/www/flyvietnam.help/ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'flyvietnam-help',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/flyvietnam.help',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

### 3.2 Käivita rakendus PM2-ga
```bash
cd /var/www/flyvietnam.help
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 4. Nginx Konfiguratsioon

### 4.1 Loo Nginx site konfiguratsioon
Loo `/etc/nginx/sites-available/flyvietnam.help`:
```nginx
server {
    listen 80;
    server_name flyvietnam.help www.flyvietnam.help;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
```

### 4.2 Aktiveeri sait
```bash
sudo ln -s /etc/nginx/sites-available/flyvietnam.help /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 5. SSL Sertifikaat (Let's Encrypt)

### 5.1 Certbot installeerimine
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 5.2 SSL sertifikaadi genereerimine
```bash
sudo certbot --nginx -d flyvietnam.help -d www.flyvietnam.help
```

---

## 6. DNS Seadistamine Namecheapis

### 6.1 Logi sisse Namecheap dashboardi
1. Mine Domain List -> flyvietnam.help -> Manage
2. Advanced DNS tab

### 6.2 Lisa DNS kirjed
| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | YOUR_SERVER_IP | Automatic |
| A | www | YOUR_SERVER_IP | Automatic |
| CNAME | www | flyvietnam.help | Automatic |

---

## 7. Uuenduste Deployment

### 7.1 Uuenduste skript
Loo `/var/www/flyvietnam.help/deploy.sh`:
```bash
#!/bin/bash
cd /var/www/flyvietnam.help
git pull origin main
npm install
npm run build
pm2 restart flyvietnam-help
```

### 7.2 Käivita uuendus
```bash
chmod +x /var/www/flyvietnam.help/deploy.sh
./deploy.sh
```

---

## 8. Monitooring

### PM2 käsud
```bash
pm2 status                    # Vaata staatust
pm2 logs flyvietnam-help      # Vaata logisid
pm2 monit                     # Reaalajas monitooring
pm2 restart flyvietnam-help   # Taaskäivita
```

### Nginx logid
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 9. Stripe Webhook Seadistamine

Lisa Stripe dashboardis uus webhook endpoint:
- URL: `https://flyvietnam.help/api/webhooks/stripe`
- Events: `checkout.session.completed`, `payment_intent.succeeded`

---

## Kokkuvõte

FlyVietnam.Help töötab nüüd eraldi IP-aadressil Namecheapi serveris:
- **Domain**: https://flyvietnam.help
- **Server IP**: YOUR_NAMECHEAP_IP
- **Port**: 3001 (internal), 443 (HTTPS)
- **Process Manager**: PM2
- **Reverse Proxy**: Nginx
- **SSL**: Let's Encrypt
