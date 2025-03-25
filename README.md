# Vocechat Chatbot

## 部署

**Vercel**

部署你的版本：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FPrivoce%2Fvocechat-chatbot-ui)

## 本地开发

> 需要 Node.js 环境

**1. 克隆代码库**

```bash
git clone https://github.com/Privoce/vocechat-chatbot-ui.git
```

**2. 安装依赖**

```bash
npm i
```

**3. 提供 OpenAI API Key**

创建`.env.local`，填入 OpenAI API Key:

```bash
OPENAI_API_KEY=YOUR_KEY
```

> 如果你所在的地区，无法访问 OpenAI 服务，可以通过`OPENAI_API_HOST`指定代理

> 如有必要，也可以设置`OPENAI_ORGANIZATION`来指定组织

**4. 跑起来**

```bash
npm run dev
```

## 配置项

| 环境变量                          | 默认值                         | 描述                                                                                   |
| --------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------- |
| VOCECHAT_ORIGIN                   |                                | Vocechat API 地址，一般和你的 vocechat 访问地址一致，比如 https://vocechat.example.com |
| VOCECHAT_BOT_ID                   |                                | Vocechat 机器人 ID，在你新建的机器人名称下面可以找到，#开头                            |
| VOCECHAT_BOT_SECRET               |                                | Vocechat 机器人 API Key，用于 Vocechat 接口授权                                        |
| OPENAI_API_KEY                    |                                | The default API key used for authentication with OpenAI                                |
| OPENAI_API_HOST                   | `https://api.openai.com`       | The base url, for Azure use `https://<endpoint>.openai.azure.com`                      |
| OPENAI_ORGANIZATION               |                                | Your OpenAI organization ID                                                            |
| DEFAULT_MODEL                     | `gpt-3.5-turbo`                | The default model to use on new conversations, for Azure use `gpt-35-turbo`            |
| NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT | [see here](utils/app/const.ts) | The default system prompt to use on new conversations                                  |
| NEXT_PUBLIC_DEFAULT_TEMPERATURE   | 1                              | The default temperature to use on new conversations                                    |

如果你没有 OpenAI API Key，可以 [在此](https://platform.openai.com/account/api-keys)申请
