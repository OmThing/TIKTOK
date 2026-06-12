type GeneratorInput = {
  regionName: string;
  regionCode: string;
  regionStyle: string;
  accountName: string;
  productName: string;
  productCategory: string;
  productHooks: string;
  productTags: string;
  videoType: string;
  emotion: string;
  duration: string;
  useElevenLabs: boolean;
  useLibTV: boolean;
};

const ctas = [
  "Save this if it feels like your story.",
  "Keep this one in mind for your next gift.",
  "If this matches your vibe, check the details before it is gone.",
  "Add it to your list if you love meaningful little pieces."
];

export function generateContent(input: GeneratorInput) {
  const isMx = input.regionCode === "MX";
  const isUk = input.regionCode === "UK";
  const baseHook =
    input.productHooks ||
    (input.productCategory.includes("地图")
      ? "Home can feel closer when you carry a tiny piece of it."
      : input.productCategory.includes("十字架")
        ? "Some pieces feel quiet, but they say a lot."
        : input.productCategory.includes("手")
          ? "This is the kind of detail you notice at the end of the day."
          : "A small custom detail can make the whole look feel personal.");

  const cta = ctas[Math.floor(Math.random() * ctas.length)];
  const voiceover = isMx
    ? "A veces un detalle pequeño puede sentirse muy personal. Esta pieza tiene ese brillo suave que se nota de cerca, sin verse exagerada. Si te recuerda a alguien o a tu propia historia, guárdala para verla después."
    : isUk
      ? "A small piece can feel personal without trying too hard. It catches the light gently, works with everyday outfits, and still feels like it means something. Save it if it feels like your kind of detail."
      : "A small piece can change the whole feeling of a look. It catches the light, feels personal, and is easy to wear every day. Save this if it feels like your story.";

  return {
    hook: baseHook,
    voiceover,
    chineseVoiceover: "一件小饰品不需要很夸张，也可以有很强的个人意义。重点展示近景、佩戴氛围、情绪价值和软性下单引导。",
    pov: `POV: 你正在为 ${input.regionName} 的 ${input.accountName} 测试一条 ${input.productName} 内容。`,
    title: isMx
      ? `Un detalle pequeño, pero muy tuyo`
      : isUk
        ? `A small detail that still feels personal`
        : `A tiny detail that feels personal`,
    subtitle: input.emotion || "personal little detail",
    caption: `${input.productName} | ${input.regionStyle}`,
    tags: input.productTags || "#customjewelry #giftideas #tiktokshop #jewelry",
    cta,
    elevenLabsText: input.useElevenLabs ? voiceover : "",
    libtvStoryboard: input.useLibTV
      ? "1. 产品近景定格\n2. 手指轻触主体细节\n3. 佩戴上身领口/手部近景\n4. 房间灯下微闪\n5. 礼物盒或桌面场景\n6. 产品旋转细节\n7. 生活化氛围镜头\n8. 结尾产品近景定格"
      : "",
    iterationAdvice: `先按 ${input.duration || "15"} 秒口播测试。若高完播低点击，下一版强化视频内小标题和结尾 CTA；若高点击低成交，检查产品页承接。`
  };
}
