// Multi-language order status email templates for backend use

export const orderStatusEmailTemplates = {
  en: {
    confirmed: {
      subject: "Your order has been confirmed",
      body: "Dear {name},\n\nYour order #{order_number} has been confirmed.\n\nThank you for shopping with us!\n\n— Dookan Team"
    },
    shipped: {
      subject: "Your order has been shipped",
      body: "Dear {name},\n\nYour order #{order_number} has been shipped.\n\nYou can track your order on our website: Home > Track your order, and enter your Order ID: {order_number}.\n\nThank you for shopping with us!\n\n— Dookan Team"
    },
    delivered: {
      subject: "Your order has been delivered",
      body: "Dear {name},\n\nYour order #{order_number} has been delivered.\n\nThank you for shopping with us!\n\n— Dookan Team"
    },
    cancelled: {
      subject: "Your order has been cancelled",
      body: "Dear {name},\n\nYour order #{order_number} has been cancelled.\nIf you have questions, please contact support.\n\n— Dookan Team"
    },
    processing: {
      subject: "Your order is processing",
      body: "Dear {name},\n\nYour order #{order_number} is now processing.\n\nThank you for shopping with us!\n\n— Dookan Team"
    }
  },
  ps: {
    confirmed: {
      subject: "ستاسو فرمایش تایید شو",
      body: "ګرانه {name}،\n\nستاسو فرمایش #{order_number} تایید شو.\n\nله موږ سره د پیرودلو مننه!\n\n— د دوکان ټیم"
    },
    shipped: {
      subject: "ستاسو فرمایش واستول شو",
      body: "ګرانه {name}،\n\nستاسو فرمایش #{order_number} واستول شو.\n\nتاسو کولای شئ خپل فرمایش د ویب‌سایټ له لارې تعقیب کړئ: کور > د فرمایش تعقیب، او د فرمایش شمېره داخل کړئ: {order_number}.\n\nله موږ سره د پیرودلو مننه!\n\n— د دوکان ټیم"
    },
    delivered: {
      subject: "ستاسو فرمایش درکړل شو",
      body: "ګرانه {name}،\n\nستاسو فرمایش #{order_number} درکړل شو.\n\nله موږ سره د پیرودلو مننه!\n\n— د دوکان ټیم"
    },
    cancelled: {
      subject: "ستاسو فرمایش لغوه شو",
      body: "ګرانه {name}،\n\nستاسو فرمایش #{order_number} لغوه شو.\nکه پوښتنې لرئ، مهرباني وکړئ له ملاتړ سره اړیکه ونیسئ.\n\n— د دوکان ټیم"
    },
    processing: {
      subject: "ستاسو فرمایش پروسس کیږي",
      body: "ګرانه {name}،\n\nستاسو فرمایش #{order_number} اوس پروسس کیږي.\n\nله موږ سره د پیرودلو مننه!\n\n— د دوکان ټیم"
    }
  },
  fa: {
    confirmed: {
      subject: "سفارش شما تایید شد",
      body: "{name} عزیز،\n\nسفارش شما به شماره #{order_number} تایید شد.\n\nاز خرید شما سپاسگزاریم!\n\n— تیم دوکان"
    },
    shipped: {
      subject: "سفارش شما ارسال شد",
      body: "{name} عزیز،\n\nسفارش شما به شماره #{order_number} ارسال شد.\n\nشما می‌توانید سفارش خود را در وب‌سایت پیگیری کنید: خانه > پیگیری سفارش، و شماره سفارش را وارد کنید: {order_number}.\n\nاز خرید شما سپاسگزاریم!\n\n— تیم دوکان"
    },
    delivered: {
      subject: "سفارش شما تحویل داده شد",
      body: "{name} عزیز،\n\nسفارش شما به شماره #{order_number} تحویل داده شد.\n\nاز خرید شما سپاسگزاریم!\n\n— تیم دوکان"
    },
    cancelled: {
      subject: "سفارش شما لغو شد",
      body: "{name} عزیز،\n\nسفارش شما به شماره #{order_number} لغو شد.\nدر صورت داشتن سوال، لطفاً با پشتیبانی تماس بگیرید.\n\n— تیم دوکان"
    },
    processing: {
      subject: "سفارش شما در حال پردازش است",
      body: "{name} عزیز،\n\nسفارش شما به شماره #{order_number} در حال پردازش است.\n\nاز خرید شما سپاسگزاریم!\n\n— تیم دوکان"
    }
  },
  de: {
    confirmed: {
      subject: "Ihre Bestellung wurde bestätigt",
      body: "Sehr geehrte/r {name},\n\nIhre Bestellung #{order_number} wurde bestätigt.\n\nVielen Dank für Ihren Einkauf!\n\n— Ihr Dookan-Team"
    },
    shipped: {
      subject: "Ihre Bestellung wurde versandt",
      body: "Sehr geehrte/r {name},\n\nIhre Bestellung #{order_number} wurde versandt.\n\nSie können Ihre Bestellung auf unserer Website verfolgen: Startseite > Bestellung verfolgen, und geben Sie Ihre Bestellnummer ein: {order_number}.\n\nVielen Dank für Ihren Einkauf!\n\n— Ihr Dookan-Team"
    },
    delivered: {
      subject: "Ihre Bestellung wurde zugestellt",
      body: "Sehr geehrte/r {name},\n\nIhre Bestellung #{order_number} wurde zugestellt.\n\nVielen Dank für Ihren Einkauf!\n\n— Ihr Dookan-Team"
    },
    cancelled: {
      subject: "Ihre Bestellung wurde storniert",
      body: "Sehr geehrte/r {name},\n\nIhre Bestellung #{order_number} wurde storniert.\nBei Fragen wenden Sie sich bitte an den Support.\n\n— Ihr Dookan-Team"
    },
    processing: {
      subject: "Ihre Bestellung wird bearbeitet",
      body: "Sehr geehrte/r {name},\n\nIhre Bestellung #{order_number} wird jetzt bearbeitet.\n\nVielen Dank für Ihren Einkauf!\n\n— Ihr Dookan-Team"
    }
  },
  fr: {
    confirmed: {
      subject: "Votre commande a été confirmée",
      body: "Cher/Chère {name},\n\nVotre commande n°{order_number} a été confirmée.\n\nMerci d'avoir acheté chez nous !\n\n— L'équipe Dookan"
    },
    shipped: {
      subject: "Votre commande a été expédiée",
      body: "Cher/Chère {name},\n\nVotre commande n°{order_number} a été expédiée.\n\nVous pouvez suivre votre commande sur notre site : Accueil > Suivre votre commande, et entrez votre numéro de commande : {order_number}.\n\nMerci d'avoir acheté chez nous !\n\n— L'équipe Dookan"
    },
    delivered: {
      subject: "Votre commande a été livrée",
      body: "Cher/Chère {name},\n\nVotre commande n°{order_number} a été livrée.\n\nMerci d'avoir acheté chez nous !\n\n— L'équipe Dookan"
    },
    cancelled: {
      subject: "Votre commande a été annulée",
      body: "Cher/Chère {name},\n\nVotre commande n°{order_number} a été annulée.\nSi vous avez des questions, veuillez contacter le support.\n\n— L'équipe Dookan"
    },
    processing: {
      subject: "Votre commande est en cours de traitement",
      body: "Cher/Chère {name},\n\nVotre commande n°{order_number} est en cours de traitement.\n\nMerci d'avoir acheté chez nous !\n\n— L'équipe Dookan"
    }
  }
};

export function getOrderStatusEmailTemplate(lang: string, status: string, params: Record<string, string | number>) {
  let l = orderStatusEmailTemplates[lang] ? lang : 'en';
  if (!orderStatusEmailTemplates[l]) {
    l = 'en';
  }
  let s = status;
  if (!orderStatusEmailTemplates[l][s]) {
    s = 'confirmed';
  }
  const template = orderStatusEmailTemplates[l][s];
  let subject = template.subject;
  let body = template.body;
  for (const key in params) {
    subject = subject.replace(new RegExp(`\{${key}\}`, 'g'), String(params[key]));
    body = body.replace(new RegExp(`\{${key}\}`, 'g'), String(params[key]));
  }
  return { subject, body };
}
