# Email Setup Guide for zmadookan.com

## Overview

This guide covers setting up:
1. **Business email accounts** (info@, support@, employee1@, etc.)
2. **Transactional emails** (password reset, order status, etc.)

---

## Part 1: Business Email Accounts (Free Options)

### Option A: Check Hostinger Email (Recommended First)

1. Log into [Hostinger hPanel](https://hpanel.hostinger.com)
2. Select your domain `zmadookan.com`
3. Go to **Emails** → **Email Accounts**
4. If available, create your accounts:
   - `info@zmadookan.com`
   - `support@zmadookan.com`
   - `employee1@zmadookan.com`
   - `admin@zmadookan.com`

### Option B: Zoho Mail Free Plan (5 Users Free)

If Hostinger email isn't available:

#### Step 1: Sign Up for Zoho Mail
1. Go to [https://www.zoho.com/mail/zohomail-pricing.html](https://www.zoho.com/mail/zohomail-pricing.html)
2. Click **"Forever Free Plan"** (5 users, 5GB/user)
3. Sign up and add your domain `zmadookan.com`

#### Step 2: Verify Domain Ownership
Zoho will ask you to add a TXT record to prove you own the domain.

Add this DNS record in Hostinger:
```
Type: TXT
Host: @
Value: zoho-verification=zb12345678.zmverify.zoho.com
TTL: 3600
```

#### Step 3: Configure MX Records
In Hostinger DNS settings, add these MX records:

```
Priority: 10    Host: @    Value: mx.zoho.com
Priority: 20    Host: @    Value: mx2.zoho.com
Priority: 50    Host: @    Value: mx3.zoho.com
```

#### Step 4: Configure SPF Record (Prevent Spam)
```
Type: TXT
Host: @
Value: v=spf1 include:zoho.com ~all
```

#### Step 5: Configure DKIM (Email Authentication)
Zoho will provide a DKIM key. Add it as:
```
Type: TXT
Host: zmail._domainkey
Value: [Zoho provides this value]
TTL: 3600
```

#### Step 6: Create Email Accounts
In Zoho Admin Console, create:
- `info@zmadookan.com` (General inquiries)
- `support@zmadookan.com` (Customer support)
- `employee1@zmadookan.com` (Staff)
- `noreply@zmadookan.com` (Automated emails)
- `admin@zmadookan.com` (Admin notifications)

---

## Part 2: Transactional Emails (Password Reset, Orders)

Your backend already uses **SendGrid** for transactional emails. Here's the current setup:

### Current Configuration
```env
# In backend-afghan-grocery/.env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
SUPPORT_EMAIL=support@zmadookan.com
```

### SendGrid Free Tier
- **100 emails/day** free forever
- Good deliverability
- No credit card required

### Important: Verify Your Sender Email

For SendGrid to send emails FROM `support@zmadookan.com`, you need to:

1. Log into [SendGrid](https://app.sendgrid.com)
2. Go to **Settings** → **Sender Authentication**
3. Complete **Domain Authentication** for `zmadookan.com`:
   - Add CNAME records provided by SendGrid
   - This improves deliverability significantly

### Required DNS Records for SendGrid
SendGrid will ask you to add these CNAME records:

```
Host: em1234.zmadookan.com  →  u1234567.wl.sendgrid.net
Host: s1._domainkey        →  s1.domainkey.u1234567.wl.sendgrid.net
Host: s2._domainkey        →  s2.domainkey.u1234567.wl.sendgrid.net
```

---

## Part 3: DNS Records Summary

After setup, your DNS should include:

| Type  | Host             | Value                                    | Purpose        |
|-------|------------------|------------------------------------------|----------------|
| MX    | @                | mx.zoho.com (priority 10)                | Email routing  |
| MX    | @                | mx2.zoho.com (priority 20)               | Email routing  |
| TXT   | @                | v=spf1 include:zoho.com include:sendgrid.net ~all | SPF |
| TXT   | zmail._domainkey | [Zoho DKIM value]                        | DKIM           |
| CNAME | s1._domainkey    | [SendGrid DKIM value]                    | SendGrid DKIM  |
| CNAME | s2._domainkey    | [SendGrid DKIM value]                    | SendGrid DKIM  |

---

## Part 4: Alternative Free SMTP Providers

If you want to switch from SendGrid:

### Brevo (Sendinblue) - 300 emails/day
```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASS=your_smtp_key
```

### Mailjet - 200 emails/day
```env
SMTP_HOST=in-v3.mailjet.com
SMTP_PORT=587
SMTP_USER=your_api_key
SMTP_PASS=your_secret_key
```

### Resend - 3,000 emails/month
```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_your_api_key
```

---

## Part 5: Self-Hosted Mail Server (NOT Recommended)

Setting up your own mail server on the VPS is **NOT recommended** because:

1. **Deliverability Issues**: VPS IPs are often flagged as spam
2. **Complexity**: Requires Postfix + Dovecot + SpamAssassin + OpenDKIM + fail2ban
3. **Maintenance**: Constant security updates, blacklist monitoring
4. **Resources**: Mail servers consume significant RAM/CPU
5. **Time Investment**: 10+ hours initial setup, ongoing maintenance

**If you still want to try**, use [Mail-in-a-Box](https://mailinabox.email/) or [Mailcow](https://mailcow.email/) which automate the setup.

---

## Quick Checklist

- [ ] Check if Hostinger includes email hosting
- [ ] If not, sign up for Zoho Mail Free
- [ ] Add MX records to DNS
- [ ] Add SPF record to DNS
- [ ] Add DKIM records to DNS
- [ ] Create business email accounts
- [ ] Verify SendGrid domain authentication
- [ ] Test sending password reset emails
- [ ] Test receiving emails at support@zmadookan.com

---

## Email Accounts to Create

| Email                    | Purpose                          |
|--------------------------|----------------------------------|
| info@zmadookan.com       | General inquiries, public contact|
| support@zmadookan.com    | Customer support, transactional  |
| admin@zmadookan.com      | Admin notifications              |
| noreply@zmadookan.com    | Automated system emails          |
| employee1@zmadookan.com  | Staff member                     |
| employee2@zmadookan.com  | Staff member                     |

---

## Testing Your Setup

### Test Receiving Emails
Send a test email from your personal email to `info@zmadookan.com`

### Test Sending Transactional Emails
Use your password reset function:
1. Go to your site's login page
2. Click "Forgot Password"
3. Enter an email address
4. Check if the email arrives

### Check Email Deliverability
Use [https://www.mail-tester.com/](https://www.mail-tester.com/) to test your email score.

---

## Support

If you have issues:
- **Hostinger Email**: Contact Hostinger support via hPanel
- **Zoho Mail**: Check [Zoho Mail Help](https://help.zoho.com/portal/en/kb/mail)
- **SendGrid**: Check [SendGrid Docs](https://docs.sendgrid.com/)
