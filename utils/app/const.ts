export const DEFAULT_SYSTEM_PROMPT =
  process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT ||
  "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.";

export const OPENAI_API_HOST ='https://openkey.cloud'
  process.env.OPENAI_API_HOST || 'https://api.openai.com';

export const DEFAULT_TEMPERATURE =
  parseFloat(process.env.NEXT_PUBLIC_DEFAULT_TEMPERATURE || "1");

export const OPENAI_API_TYPE =
  process.env.OPENAI_API_TYPE || 'openai';

export const OPENAI_API_VERSION =
  process.env.OPENAI_API_VERSION || '2023-03-15-preview';

export const OPENAI_API_KEY='sk-Z0yTputYSWSxxjVcAf86A96e844d4fC1A8F18fDd5e550a99'

export const OPENAI_ORGANIZATION =
  process.env.OPENAI_ORGANIZATION || '';

export const VOCECHAT_ORIGIN ='http://154.9.254.68:3019'
  process.env.VOCECHAT_ORIGIN || '';

export const VOCECHAT_BOT_ID =5
  Number(process.env.VOCECHAT_BOT_ID) || 0;

export const VOCECHAT_BOT_SECRET ='cc5756ed6c095ace20f6f375e289ef465e654d787857b6fa1e17566a1ce0e11b7b22756964223a352c226e6f6e6365223a22537366584e77704545575941414141416150534736584a425570325134523457227d'
  process.env.VOCECHAT_BOT_SECRET || '';

export const AZURE_DEPLOYMENT_ID =
  process.env.AZURE_DEPLOYMENT_ID || '';
