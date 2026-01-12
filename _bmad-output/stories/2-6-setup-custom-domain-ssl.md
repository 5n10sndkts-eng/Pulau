# Task 2.6: Set Up Custom Domain & SSL

Status: not-started
Phase: Launch Readiness Sprint - Phase 2
Priority: P0
Type: Infrastructure Setup

## Task Description

Configure custom domain (pulau.app) with SSL certificate for production deployment, ensuring secure HTTPS connections and proper DNS configuration.

## Acceptance Criteria

- [ ] Domain purchased and registered
- [ ] DNS records configured for hosting platform
- [ ] SSL certificate provisioned and active
- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] WWW subdomain configured
- [ ] Domain verification complete
- [ ] Email DNS records set (for Resend)

## Steps

### 1. Purchase Domain (if not already owned)

**Recommended Registrars:**
- Namecheap: ~$10/year for .app domains
- Google Domains: ~$12/year
- Cloudflare Registrar: At-cost pricing

**Domain: pulau.app** (or alternative if taken)

### 2. Configure DNS for Vercel

#### A Record Method (Recommended)

1. Log in to domain registrar DNS management
2. Add A records:

```
Type    Name    Value
A       @       76.76.21.21
A       www     76.76.21.21
```

#### CNAME Method (Alternative)

```
Type     Name    Value
CNAME    @       cname.vercel-dns.com
CNAME    www     cname.vercel-dns.com
```

### 3. Add Domain in Vercel

```bash
# Via CLI
vercel domains add pulau.app

# Or via Dashboard:
# 1. Go to Project Settings → Domains
# 2. Enter: pulau.app
# 3. Click "Add"
# 4. Follow verification instructions
```

### 4. Configure WWW Redirect

In Vercel:
1. Add both `pulau.app` and `www.pulau.app`
2. Set `pulau.app` as primary
3. Enable "Redirect www to root domain"

Or in DNS:
```
Type     Name    Value
CNAME    www     pulau.app
```

### 5. Set Up SSL Certificate

**Vercel (Automatic):**
- SSL certificate provisioned automatically
- Uses Let's Encrypt
- Auto-renews every 90 days
- Supports wildcard certificates

**Verify SSL:**
```bash
# Check certificate
curl -vI https://pulau.app 2>&1 | grep -i "SSL certificate"

# Test SSL with SSL Labs
# https://www.ssllabs.com/ssltest/analyze.html?d=pulau.app
# Target: A+ rating
```

### 6. Configure Email DNS (Resend)

Add email authentication records (from Story 30.1.3):

```
Type    Name                          Value
TXT     @                             v=spf1 include:_spf.resend.com ~all
TXT     resend._domainkey             [DKIM value from Resend]
TXT     _dmarc                        v=DMARC1; p=quarantine; rua=mailto:dmarc@pulau.app
MX      @                             (if using custom email)
```

### 7. Enforce HTTPS

**Vercel automatically enforces HTTPS**, but verify:

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

### 8. Set Up Additional Subdomains

```
Type     Name       Value
CNAME    api        [Project-ref].supabase.co
CNAME    admin      pulau.app
CNAME    blog       pulau.app (or separate hosting)
```

## DNS Configuration Complete Example

```
# Root domain
A        @          76.76.21.21
AAAA     @          2606:4700:3031::ac43:8d67 (if IPv6)

# WWW redirect
CNAME    www        pulau.app

# Email (Resend)
TXT      @          v=spf1 include:_spf.resend.com ~all
TXT      resend._domainkey    [DKIM-VALUE]
TXT      _dmarc     v=DMARC1; p=quarantine; rua=mailto:dmarc@pulau.app

# Verification (if needed)
TXT      @          vercel-verification=[TOKEN]

# Subdomains
CNAME    api        [project-ref].supabase.co
CNAME    blog       pulau-blog.vercel.app
```

## Domain Verification

```bash
# Verify DNS propagation
dig pulau.app
dig www.pulau.app
dig resend._domainkey.pulau.app TXT

# Check SSL certificate
echo | openssl s_client -servername pulau.app -connect pulau.app:443 2>/dev/null | openssl x509 -noout -dates

# Test HTTPS redirect
curl -I http://pulau.app
# Should return 301/302 to https://pulau.app

# Verify HSTS header
curl -I https://pulau.app | grep -i strict-transport
```

## Security Best Practices

### 1. Enable DNSSEC (if registrar supports)

Adds cryptographic signatures to DNS records to prevent tampering.

### 2. Use Cloudflare Proxy (Optional)

**Pros:**
- Additional DDoS protection
- Advanced analytics
- Free CDN

**Cons:**
- Additional complexity
- May interfere with Vercel's edge network

**If using:**
```
Type     Name    Value                  Proxy
A        @       76.76.21.21            Enabled
CNAME    www     pulau.app              Enabled
```

### 3. Set CAA Records

Specify which Certificate Authorities can issue certificates:

```
Type    Name    Value
CAA     @       0 issue "letsencrypt.org"
CAA     @       0 issuewild "letsencrypt.org"
CAA     @       0 iodef "mailto:security@pulau.app"
```

## Testing Checklist

- [ ] https://pulau.app loads correctly
- [ ] http://pulau.app redirects to HTTPS
- [ ] https://www.pulau.app redirects to pulau.app
- [ ] SSL certificate valid and trusted
- [ ] SSL Labs rating A or A+
- [ ] HSTS header present
- [ ] Email DNS records verified (mail-tester.com)
- [ ] No mixed content warnings
- [ ] All assets load over HTTPS

## Validation Tools

```bash
# DNS propagation
https://dnschecker.org

# SSL test
https://www.ssllabs.com/ssltest/

# Email authentication
https://www.mail-tester.com

# Security headers
https://securityheaders.com

# Performance
https://web.dev/measure/
```

## Update Application URLs

After domain is live, update:

### Environment Variables
```bash
# Update in Vercel
vercel env rm VITE_APP_URL production
vercel env add VITE_APP_URL production
# Enter: https://pulau.app

# Update in Supabase Edge Functions
supabase secrets set APP_URL=https://pulau.app
```

### Stripe Webhooks
1. Go to Stripe Dashboard → Webhooks
2. Update endpoint URL:
   - Old: `https://[project-ref].supabase.co/functions/v1/stripe-webhook`
   - Keep (Supabase URL still needed for webhooks)

### OAuth Redirect URLs (if applicable)
- Update Google/Facebook OAuth URLs
- Update Supabase Auth redirect URLs

### sitemap.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://pulau.app/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://pulau.app/experiences</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

### robots.txt
```
User-agent: *
Allow: /

Sitemap: https://pulau.app/sitemap.xml
```

## Common Issues

| Issue | Solution |
|-------|----------|
| DNS not propagating | Wait 24-48 hours, or flush local DNS: `ipconfig /flushdns` |
| SSL certificate pending | Wait 10-15 minutes, Vercel auto-provisions |
| CORS errors | Update APP_URL in all services |
| Email DKIM fails | Verify DKIM record copied exactly from Resend |
| Mixed content warnings | Ensure all resources use HTTPS URLs |
| WWW not redirecting | Verify redirect rule in Vercel or add CNAME |

## Related Files

- `public/robots.txt` (create)
- `public/sitemap.xml` (create)
- `vercel.json` (update with HSTS headers)
- `.env.production` (update APP_URL)

## Estimated Time

1-2 hours (+ 24-48 hours for DNS propagation)

## Dependencies

- Task 2.5 (Hosting configured)
- Domain registrar account
- Access to DNS management

## Success Validation

- [ ] https://pulau.app loads in < 2 seconds
- [ ] SSL Labs rating: A+
- [ ] Security Headers rating: A
- [ ] HSTS preload eligible
- [ ] Email DNS verified
- [ ] No browser security warnings
- [ ] All redirects working (HTTP→HTTPS, WWW→root)

## Post-Setup

### Submit to HSTS Preload (Optional)
https://hstspreload.org
- Enables browser-level HSTS before first visit
- Permanent decision, difficult to reverse

### Monitor SSL Expiry
- Vercel auto-renews, but set up monitoring
- Use: https://www.sslshopper.com/ssl-checker.html

### Set Up Domain Auto-Renewal
- Enable auto-renewal in registrar
- Prevent accidental expiration

## Emergency Rollback

If domain configuration causes issues:

```bash
# Remove domain from Vercel
vercel domains rm pulau.app

# Temporarily use Vercel subdomain
# pulau.vercel.app

# Update environment variables back
# Redeploy
```
