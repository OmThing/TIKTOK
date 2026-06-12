type DeepSeekGenerateInput = {
  regionName: string;
  regionCode: string;
  regionLanguage: string;
  regionStyle: string;
  accountName: string;
  accountPositioning: string;
  productName: string;
  productCategory: string;
  sellingPoints: string;
  emotionalPoints: string;
  productHooks: string;
  productTags: string;
  videoType: string;
  emotion: string;
  duration: string;
  useHistory: boolean;
  useCompetitor: boolean;
  useElevenLabs: boolean;
  useLibTV: boolean;
};

export type GeneratedContent = {
  hook: string;
  voiceover: string;
  chineseVoiceover: string;
  pov: string;
  title: string;
  subtitle: string;
  caption: string;
  tags: string;
  cta: string;
  elevenLabsText: string;
  libtvStoryboard: string;
  iterationAdvice: string;
};

export function deepSeekConfig() {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim() ?? "";
  return {
    configured: Boolean(apiKey),
    baseUrl: (process.env.DEEPSEEK_BASE_URL?.trim() || "https://api.deepseek.com").replace(/\/$/, ""),
    model: process.env.DEEPSEEK_MODEL?.trim() || "deepseek-v4-flash"
  };
}

function extractJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const raw = fenced ?? text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return raw;
  return raw.slice(start, end + 1);
}

function normalizeGeneratedContent(value: Partial<GeneratedContent>): GeneratedContent {
  return {
    hook: String(value.hook ?? ""),
    voiceover: String(value.voiceover ?? ""),
    chineseVoiceover: String(value.chineseVoiceover ?? ""),
    pov: String(value.pov ?? ""),
    title: String(value.title ?? ""),
    subtitle: String(value.subtitle ?? ""),
    caption: String(value.caption ?? ""),
    tags: String(value.tags ?? ""),
    cta: String(value.cta ?? ""),
    elevenLabsText: String(value.elevenLabsText ?? value.voiceover ?? ""),
    libtvStoryboard: String(value.libtvStoryboard ?? ""),
    iterationAdvice: String(value.iterationAdvice ?? "")
  };
}

export async function generateWithDeepSeek(input: DeepSeekGenerateInput): Promise<GeneratedContent> {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  const config = deepSeekConfig();
  if (!apiKey) {
    throw new Error("DeepSeek API key 未配置。请在 .env 中填写 DEEPSEEK_API_KEY 后重启本地服务。");
  }

  const prompt = `
你是一个 TikTok 饰品带货内容增长助手。请根据下面的本地业务信息生成一条可直接保存到内容库的视频脚本。

地区：${input.regionName} ${input.regionCode}
地区语言：${input.regionLanguage}
地区风格：${input.regionStyle}
账号：${input.accountName}
账号定位：${input.accountPositioning}
产品：${input.productName}
产品分类：${input.productCategory}
产品卖点：${input.sellingPoints}
情绪卖点：${input.emotionalPoints}
常用 Hook：${input.productHooks}
常用 Tags：${input.productTags}
视频类型：${input.videoType}
情绪方向：${input.emotion}
口播时长：${input.duration || "15"} 秒左右
参考历史爆款：${input.useHistory ? "是" : "否"}
参考对标视频：${input.useCompetitor ? "是" : "否"}
生成 ElevenLabs 文本：${input.useElevenLabs ? "是" : "否"}
生成 LibTV 分镜：${input.useLibTV ? "是" : "否"}

硬性规则：
1. Voiceover 适合 ElevenLabs 直接配音，不要动作说明，不要括号，不要以 POV 开头。
2. 默认 15 秒左右，不要太长。
3. 结尾必须有软性下单引导，不能每次都像硬广。
4. Tags 要适合 TikTok Shop 饰品带货。
5. 如果是手链手镯，不要宣称医疗功效。
6. 必须输出 JSON，不要 Markdown，不要解释。

JSON 字段必须完全是：
hook, voiceover, chineseVoiceover, pov, title, subtitle, caption, tags, cta, elevenLabsText, libtvStoryboard, iterationAdvice
`;

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: "system",
          content:
            "You generate concise TikTok commerce scripts for jewelry products. Return valid compact JSON only."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      stream: false,
      temperature: 0.8
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`DeepSeek API 调用失败：${response.status} ${detail.slice(0, 500)}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("DeepSeek API 未返回可用内容。");
  }

  const parsed = JSON.parse(extractJson(content)) as Partial<GeneratedContent>;
  return normalizeGeneratedContent(parsed);
}
