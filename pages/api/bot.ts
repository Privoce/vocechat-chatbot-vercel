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

const sendMessageToBot = (url: string, message: string) => {
  // 通过 bot 给 vocechat 发消息
  try {
    let resp = fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'text/markdown',
        'x-api-key': VOCECHAT_BOT_SECRET,
      },
      body: message,
    });
    console.log('bot: send successfully', resp);
  } catch (error) {
    console.error('bot: send failed', url, JSON.stringify(error, null, 2));
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log(
    'bot: from webhook push',
    req.method,
    VOCECHAT_BOT_ID,
    VOCECHAT_ORIGIN,
    VOCECHAT_BOT_SECRET.slice(-5),
  );
  let _url = `${VOCECHAT_ORIGIN}/api/bot/`;
  let handlerResp: Response | null = null;
  try {
    switch (req.method) {
      case 'GET':
        handlerResp = new Response(`${req.method}: bot resp`, { status: 200 });
        break;
      case 'POST':
        {
          const data = (await req.json()) as Message;
          console.log('bot: handler POST', data);
          const mentions = (data.detail.properties ?? {}).mentions ?? [];
          // 机器人本人发的消息不处理
          if (data.from_uid == VOCECHAT_BOT_ID) {
            console.log('bot: ignore sent by bot self');
            handlerResp = new Response(`ignore sent by bot self`, {
              status: 200,
            });
            break;
          }
          // 群里没 at 此 bot 的消息不处理
          if ('gid' in data.target) {
            const mentionedAtGroup = mentions.some((m) => m == VOCECHAT_BOT_ID);
            if (!mentionedAtGroup) {
              console.log('bot: ignore not mention at group');
              handlerResp = new Response(`ignore not mention at group`, {
                status: 200,
              });
              break;
            }
          }
          // 直接回复该消息
          _url += `reply/${data.mid}`;
          // 直接在会话里回复
          // if ('gid' in data.target) {
          //     _url += `send_to_group/${data.target.gid}`;

          // } else {
          //     _url += `send_to_user/${data.from_uid}`;
          // }
          console.log('bot: start req ChatGPT');
          // sendMessageToBot(_url, "**正在生成回答，请耐心等待...**");
          const resp = await fetch(`${OPENAI_API_HOST}/v1/chat/completions`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              'OpenAI-Organization': OPENAI_ORGANIZATION,
            },
            method: 'POST',
            body: JSON.stringify({
              model: OPENAI_DEFAULT_MODEL,
              messages: [
                {
                  role: 'system',
                  content:
                    "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.",
                },
                {
                  role: 'user',
                  // 去掉 @xxx
                  content: data.detail.content.replace(/@[0-9]+/g, '').trim(),
                },
              ],
              max_tokens: 1000,
              temperature: 1,
              stream: false,
            }),
          });
          const gptData = await resp.json();
          console.log('bot: gptData', gptData);
          const [
            {
              message: { content },
            },
          ] = gptData.choices;
          console.log('bot: end req ChatGPT', gptData, content, _url);
          // 通过 bot 给 vocechat 发消息
          sendMessageToBot(_url, content);
          handlerResp = new Response(`OK`, { status: 200 });
        }
        break;
      default:
        {
          console.log('bot: handler default', req.method);
          handlerResp = new Response(`${req.method}: bot resp`, {
            status: 200,
          });
        }
        break;
    }
    return handlerResp;
  } catch (error) {
    console.error('bot: error', error);
    // 通过 bot 给 vocechat 发消息
    sendMessageToBot(_url, '**Something Error!**');
    return new Response(`Error`, { status: 200 });
  }
};

export default handler;
