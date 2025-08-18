import {
  OPENAI_API_HOST,
  OPENAI_DEFAULT_MODEL,
  OPENAI_ORGANIZATION,
  VOCECHAT_BOT_ID,
  VOCECHAT_BOT_SECRET,
  VOCECHAT_ORIGIN,
} from '@/utils/app/const';
import { Message } from '@/types/vocechat';

export const config = {
  runtime: 'edge',
};

const isBotMentioned = (message: Message, botId: number): boolean => {
  const mentions = message.detail.properties?.mentions ?? [];
  const content = message.detail.content;

  const isMentionedInArray = mentions.some(
    (id) => id.toString() === botId.toString(),
  );
  if (isMentionedInArray) return true;

  const mentionRegex = new RegExp(`@\\s*${botId}(\\b|$)`);
  const isMentionedInText = mentionRegex.test(content);
  if (isMentionedInText) return true;

  return false;
};

const sendMessageToBot = async (url: string, message: string): Promise<void> => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'text/markdown',
        'x-api-key': VOCECHAT_BOT_SECRET,
      },
      body: message,
    });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`bot: Failed to send message to VoceChat. Status: ${response.status}`, errorBody);
    } else {
      console.log('bot: Message sent to VoceChat successfully.');
    }
  } catch (error) {
    console.error('bot: Network or other error occurred while sending message.', error);
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let data: Message;
  try {
    data = await req.json();
  } catch (error) {
    console.error('bot: Failed to parse request JSON.', error);
    return new Response('Invalid JSON body.', { status: 400 });
  }

  if (data.from_uid === VOCECHAT_BOT_ID) {
    return new Response('OK', { status: 200 });
  }

  if ('gid' in data.target) {
    if (!isBotMentioned(data, VOCECHAT_BOT_ID)) {
      return new Response('OK', { status: 200 });
    }
  }

  // --- 最终修正：不再区分私聊和群聊，统一使用 reply/{mid} ---
  const targetUrl = `${VOCECHAT_ORIGIN}/api/bot/reply/${data.mid}`;
  console.log('bot: Final constructed URL for API call (using reply):', targetUrl);

  try {
    const userContent = data.detail.content.replace(/@\s*\d+/g, '').trim();

    const openAIResponse = await fetch(`${OPENAI_API_HOST}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        ...(OPENAI_ORGANIZATION && { 'OpenAI-Organization': OPENAI_ORGANIZATION }),
      },
      body: JSON.stringify({
        model: OPENAI_DEFAULT_MODEL,
        messages: [
          { role: 'system', content: "You are ChatGPT, a large language model trained by OpenAI. Respond using markdown." },
          { role: 'user', content: userContent },
        ],
        max_tokens: 8192,
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      await sendMessageToBot(targetUrl, `**Error from OpenAI:** ${errorData.error?.message || 'Unknown error'}`);
      return new Response('OK', { status: 200 });
    }

    const gptData = await openAIResponse.json();
    const content = gptData.choices?.[0]?.message?.content;

    if (content) {
      await sendMessageToBot(targetUrl, content);
    } else {
      await sendMessageToBot(targetUrl, '**Error:** Received an empty response from the AI.');
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('bot: An unexpected error occurred in the handler.', error);
    if (targetUrl) {
      await sendMessageToBot(targetUrl, '**Error:** An unexpected error occurred while processing your request.');
    }
    return new Response('OK', { status: 200 });
  }
};

export default handler;
