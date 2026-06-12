import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const productCategories = [
  "镶钻数字项链",
  "字母项链",
  "国家地图项链",
  "镶钻十字架",
  "多巴胺十字架",
  "贝壳十字架",
  "圣母耶稣项链",
  "手链",
  "手镯",
  "耳环 / 耳饰",
  "定制礼品",
  "其他 AI 带货产品"
];

async function main() {
  const us = await prisma.region.upsert({
    where: { code: "US" },
    update: {},
    create: {
      name: "美区",
      code: "US",
      language: "英文 + 中文解释",
      style: "节奏快、钩子强、直接，适合 TikTok 带货。",
      learningLibrary: "保存美区爆款标题、强钩子、短口播和转化型 CTA。"
    }
  });

  const uk = await prisma.region.upsert({
    where: { code: "UK" },
    update: {},
    create: {
      name: "英区",
      code: "UK",
      language: "英文 + 中文解释",
      style: "自然、克制、真实生活感，避免美式浮夸。",
      learningLibrary: "保存英国账号的生活感开头、轻种草表达和评论反馈。"
    }
  });

  const mx = await prisma.region.upsert({
    where: { code: "MX" },
    update: {},
    create: {
      name: "墨西哥区",
      code: "MX",
      language: "墨西哥西班牙语 + 中文解释",
      style: "更情绪化、更热、更贴近墨西哥用户，避免机器翻译腔。",
      learningLibrary: "保存墨西哥西语表达、情绪钩子、产品定位和对标账号。"
    }
  });

  const accounts = [
    {
      name: "Cherry 手机44号 宗教",
      regionId: us.id,
      phoneNo: "44",
      positioning: "宗教饰品、十字架、信念感佩戴氛围",
      mainProduct: "镶钻十字架 / 圣母耶稣项链"
    },
    {
      name: "Jeroioo 手机33号 数字",
      regionId: us.id,
      phoneNo: "33",
      positioning: "个性化数字、字母和纪念意义饰品",
      mainProduct: "镶钻数字项链 / 字母项链"
    },
    {
      name: "Katiioo 手机45号 手部",
      regionId: uk.id,
      phoneNo: "45",
      positioning: "手链、手镯、睡前佩戴和女性手饰",
      mainProduct: "手链 / 手镯"
    },
    {
      name: "Ella 手机22号 地图",
      regionId: mx.id,
      phoneNo: "22",
      positioning: "国家身份、家乡属性、距离感和 country pride",
      mainProduct: "国家地图项链"
    }
  ];

  for (const account of accounts) {
    const existing = await prisma.account.findFirst({ where: { name: account.name } });
    if (!existing) {
      await prisma.account.create({
        data: {
          ...account,
          status: "正常",
          publishStrategy: "优先测试当地晚间高活跃时段，保留 24h/48h/72h 数据。",
          dailyPostTarget: 2,
          styleNotes: "短口播、强钩子、产品近景、结尾软性下单引导。",
          latestReview: "MVP 初始账号，等待录入首批视频数据。"
        }
      });
    }
  }

  for (const category of productCategories) {
    const existing = await prisma.product.findFirst({ where: { name: category } });
    if (!existing) {
      await prisma.product.create({
        data: {
          name: category,
          category,
          regionIds: [us.id, uk.id, mx.id].join(","),
          sellingPoints: "可定制、适合短视频近景展示、礼物属性强。",
          emotionalPoints: "身份感、纪念意义、信念感或日常陪伴感。",
          audience: "TikTok 饰品兴趣用户、礼物购买人群、个性化饰品用户。",
          scenes: "上身近景、房间灯、礼物拆封、睡前氛围、日常穿搭。",
          videoStyles: "实拍 / UGC / AI 视频 / LibTV 分镜",
          hooks: "I did not expect this little piece to feel so personal.",
          titleDirections: "身份感 + 产品关键词 + 软性情绪",
          tags: "#customjewelry #tiktokshop #giftideas #necklace",
          cta: "If it feels like your story, save it for later.",
          materialStatus: "待整理"
        }
      });
    }
  }

  const mapProduct = await prisma.product.findFirst({ where: { category: "国家地图项链" } });
  const ella = await prisma.account.findFirst({ where: { name: "Ella 手机22号 地图" } });
  if (mapProduct && ella) {
    const existingVideo = await prisma.video.findFirst({ where: { name: "地图项链身份感测试脚本" } });
    if (!existingVideo) {
      await prisma.video.create({
        data: {
          name: "地图项链身份感测试脚本",
          regionId: mx.id,
          accountId: ella.id,
          productId: mapProduct.id,
          videoType: "LibTV生成",
          status: "脚本完成",
          hook: "When home is far away, a tiny map can still feel close.",
          voiceover: "When home is far away, wearing a tiny map makes it feel a little closer. It is simple, personal, and easy to keep with you every day. Save this if it feels like your story.",
          chineseVoiceover: "当家乡很远的时候，一条小小的地图项链会让距离感变近。它简单、个人化，也适合每天戴着。如果这像你的故事，可以先收藏。",
          title: "A tiny map for the place that made you",
          subtitle: "home, but closer",
          caption: "For anyone carrying a little piece of home with them.",
          tags: "#mapnecklace #customgift #countrypride #tiktokshop",
          cta: "Save this if it feels like your story.",
          elevenLabsText: "When home is far away, wearing a tiny map makes it feel a little closer. It is simple, personal, and easy to keep with you every day. Save this if it feels like your story.",
          libtvStoryboard: "1. 近景展示项链轮廓\n2. 手指轻触地图吊坠\n3. 佩戴上身领口近景\n4. 房间灯下微闪\n5. 礼物盒打开\n6. 手机地图画面虚焦\n7. 主体近景旋转\n8. 结尾定格产品",
          libtvPrompt: "9:16 vertical, realistic jewelry close-up, no text, no subtitles, no logo, consistent necklace design, warm room light.",
          rating: "可优化",
          nextIteration: "补充墨西哥西语版本，测试更强的家乡情绪开头。"
        }
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
