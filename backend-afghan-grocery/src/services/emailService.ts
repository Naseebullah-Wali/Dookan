import nodemailer from 'nodemailer';
import config from '../config/index';

// OTP Configuration
const OTP_EXPIRY_MINUTES = 15;

interface EmailTemplate {
  subject: string;
  html: string;
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;
  private static isConfigured: boolean = false;

  /**
   * Initialize email transporter
   */
  private static getTransporter(): nodemailer.Transporter | null {
    if (this.transporter) {
      return this.transporter;
    }

    // Use environment variables for SMTP configuration
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.warn('⚠️ SMTP not configured. OTP codes will be logged to console only.');
      this.isConfigured = false;
      return null;
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    this.isConfigured = true;
    return this.transporter;
  }

  /**
   * Send OTP verification email
   */
  static async sendOTPEmail(
    email: string,
    code: string,
    name: string,
    language: string = 'en'
  ): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      
      // If no transporter configured, log code for development
      if (!transporter) {
        console.log(`[DEV] OTP for ${email}: ${code}`);
        return true;
      }

      const template = this.getOTPTemplate(code, name, language);
      const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
      const fromName = process.env.SMTP_FROM_NAME || 'Dookan';

      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        subject: template.subject,
        html: template.html,
      });

      return true;
    } catch (error: any) {
      console.error('Email send failed:', error.message);
      
      // In development, don't fail
      if (process.env.NODE_ENV !== 'production') {
        return true;
      }
      
      return false;
    }
  }

  /**
   * Get OTP email template by language
   */
  private static getOTPTemplate(code: string, name: string, language: string): EmailTemplate {
    const templates: Record<string, EmailTemplate> = {
      en: {
        subject: 'Your Dookan Verification Code',
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2d7a4f; margin: 0; font-size: 28px;">🛒 Dookan</h1>
              <p style="color: #666; margin-top: 5px;">Afghan Grocery Store</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #2d7a4f 0%, #45a049 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
              <h2 style="color: white; margin: 0 0 10px 0; font-size: 22px;">Welcome, ${name}! 👋</h2>
              <p style="color: rgba(255,255,255,0.9); margin: 0;">Here's your verification code</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; text-align: center; margin: 20px 0; border-radius: 12px; border: 2px dashed #2d7a4f;">
              <p style="color: #666; margin: 0 0 15px 0; font-size: 14px;">Enter this code to verify your email:</p>
              <div style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #2d7a4f; font-family: 'Courier New', monospace;">${code}</div>
            </div>
            
            <div style="text-align: center; padding: 20px;">
              <p style="color: #666; margin: 0;">⏰ This code expires in <strong>${OTP_EXPIRY_MINUTES} minutes</strong></p>
              <p style="color: #999; font-size: 13px; margin-top: 15px;">If you didn't create an account with Dookan, please ignore this email.</p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p style="margin: 0;">© ${new Date().getFullYear()} Dookan - Afghan Grocery Store</p>
              <p style="margin: 5px 0 0 0;">Fresh & Authentic Afghan Products</p>
            </div>
          </div>
        `
      },
      ps: {
        subject: 'ستاسو د دوکان تصدیق کوډ',
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff; direction: rtl;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2d7a4f; margin: 0; font-size: 28px;">🛒 دوکان</h1>
              <p style="color: #666; margin-top: 5px;">افغان پرچون پلورنځی</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #2d7a4f 0%, #45a049 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
              <h2 style="color: white; margin: 0 0 10px 0; font-size: 22px;">ښه راغلاست، ${name}! 👋</h2>
              <p style="color: rgba(255,255,255,0.9); margin: 0;">ستاسو د تصدیق کوډ دلته دی</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; text-align: center; margin: 20px 0; border-radius: 12px; border: 2px dashed #2d7a4f;">
              <p style="color: #666; margin: 0 0 15px 0; font-size: 14px;">د خپل بریښنالیک تصدیق لپاره دا کوډ ولیکئ:</p>
              <div style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #2d7a4f; font-family: 'Courier New', monospace; direction: ltr;">${code}</div>
            </div>
            
            <div style="text-align: center; padding: 20px;">
              <p style="color: #666; margin: 0;">⏰ دا کوډ په <strong>${OTP_EXPIRY_MINUTES} دقیقو</strong> کې پای ته رسیږي</p>
              <p style="color: #999; font-size: 13px; margin-top: 15px;">که تاسو په دوکان کې حساب نه دی جوړ کړی، مهرباني وکړئ دا بریښنالیک له پامه وغورځوئ.</p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p style="margin: 0;">© ${new Date().getFullYear()} دوکان - افغان پرچون پلورنځی</p>
              <p style="margin: 5px 0 0 0;">تازه او اصلي افغان محصولات</p>
            </div>
          </div>
        `
      },
      fa: {
        subject: 'کد تأیید دوکان شما',
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff; direction: rtl;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2d7a4f; margin: 0; font-size: 28px;">🛒 دوکان</h1>
              <p style="color: #666; margin-top: 5px;">فروشگاه مواد غذایی افغان</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #2d7a4f 0%, #45a049 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
              <h2 style="color: white; margin: 0 0 10px 0; font-size: 22px;">خوش آمدید، ${name}! 👋</h2>
              <p style="color: rgba(255,255,255,0.9); margin: 0;">کد تأیید شما اینجاست</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; text-align: center; margin: 20px 0; border-radius: 12px; border: 2px dashed #2d7a4f;">
              <p style="color: #666; margin: 0 0 15px 0; font-size: 14px;">این کد را برای تأیید ایمیل خود وارد کنید:</p>
              <div style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #2d7a4f; font-family: 'Courier New', monospace; direction: ltr;">${code}</div>
            </div>
            
            <div style="text-align: center; padding: 20px;">
              <p style="color: #666; margin: 0;">⏰ این کد در <strong>${OTP_EXPIRY_MINUTES} دقیقه</strong> منقضی می‌شود</p>
              <p style="color: #999; font-size: 13px; margin-top: 15px;">اگر حسابی در دوکان ایجاد نکرده‌اید، لطفاً این ایمیل را نادیده بگیرید.</p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p style="margin: 0;">© ${new Date().getFullYear()} دوکان - فروشگاه مواد غذایی افغان</p>
              <p style="margin: 5px 0 0 0;">محصولات تازه و اصیل افغان</p>
            </div>
          </div>
        `
      },
      de: {
        subject: 'Ihr Dookan Bestätigungscode',
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2d7a4f; margin: 0; font-size: 28px;">🛒 Dookan</h1>
              <p style="color: #666; margin-top: 5px;">Afghanisches Lebensmittelgeschäft</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #2d7a4f 0%, #45a049 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
              <h2 style="color: white; margin: 0 0 10px 0; font-size: 22px;">Willkommen, ${name}! 👋</h2>
              <p style="color: rgba(255,255,255,0.9); margin: 0;">Hier ist Ihr Bestätigungscode</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; text-align: center; margin: 20px 0; border-radius: 12px; border: 2px dashed #2d7a4f;">
              <p style="color: #666; margin: 0 0 15px 0; font-size: 14px;">Geben Sie diesen Code ein, um Ihre E-Mail zu bestätigen:</p>
              <div style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #2d7a4f; font-family: 'Courier New', monospace;">${code}</div>
            </div>
            
            <div style="text-align: center; padding: 20px;">
              <p style="color: #666; margin: 0;">⏰ Dieser Code läuft in <strong>${OTP_EXPIRY_MINUTES} Minuten</strong> ab</p>
              <p style="color: #999; font-size: 13px; margin-top: 15px;">Wenn Sie kein Konto bei Dookan erstellt haben, ignorieren Sie bitte diese E-Mail.</p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p style="margin: 0;">© ${new Date().getFullYear()} Dookan - Afghanisches Lebensmittelgeschäft</p>
              <p style="margin: 5px 0 0 0;">Frische & authentische afghanische Produkte</p>
            </div>
          </div>
        `
      },
      fr: {
        subject: 'Votre code de vérification Dookan',
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2d7a4f; margin: 0; font-size: 28px;">🛒 Dookan</h1>
              <p style="color: #666; margin-top: 5px;">Épicerie Afghane</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #2d7a4f 0%, #45a049 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
              <h2 style="color: white; margin: 0 0 10px 0; font-size: 22px;">Bienvenue, ${name}! 👋</h2>
              <p style="color: rgba(255,255,255,0.9); margin: 0;">Voici votre code de vérification</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; text-align: center; margin: 20px 0; border-radius: 12px; border: 2px dashed #2d7a4f;">
              <p style="color: #666; margin: 0 0 15px 0; font-size: 14px;">Entrez ce code pour vérifier votre email:</p>
              <div style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #2d7a4f; font-family: 'Courier New', monospace;">${code}</div>
            </div>
            
            <div style="text-align: center; padding: 20px;">
              <p style="color: #666; margin: 0;">⏰ Ce code expire dans <strong>${OTP_EXPIRY_MINUTES} minutes</strong></p>
              <p style="color: #999; font-size: 13px; margin-top: 15px;">Si vous n'avez pas créé de compte chez Dookan, veuillez ignorer cet email.</p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p style="margin: 0;">© ${new Date().getFullYear()} Dookan - Épicerie Afghane</p>
              <p style="margin: 5px 0 0 0;">Produits afghans frais et authentiques</p>
            </div>
          </div>
        `
      }
    };

    return templates[language] || templates.en;
  }
}

export default EmailService;
