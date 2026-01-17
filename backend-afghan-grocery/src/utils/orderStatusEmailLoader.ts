// orderStatusEmailLoader.ts
// Loads order status email templates from i18n JSON files
import path from 'path';
import fs from 'fs';

const locales = ['en', 'ps', 'fa', 'de', 'fr'];
const templates: Record<string, any> = {};

for (const locale of locales) {
  try {
    const filePath = path.join(__dirname, '../../afghan-grocery-vue/src/i18n/locales', `${locale}.json`);
    const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    templates[locale] = json.orderStatusEmail;
  } catch (e) {
    templates[locale] = undefined;
  }
}

// Deprecated: getOrderStatusEmailTemplate is now provided by orderStatusEmailTemplates.ts
