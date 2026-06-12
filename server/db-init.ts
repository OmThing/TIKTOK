import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const dbPath = join(process.cwd(), "prisma", "dev.db");

function now() {
  return new Date().toISOString();
}

function insertIfMissing(db: DatabaseSync, table: string, uniqueColumn: string, uniqueValue: string, data: Record<string, unknown>) {
  const exists = db.prepare(`SELECT id FROM ${table} WHERE ${uniqueColumn} = ? LIMIT 1`).get(uniqueValue);
  if (exists) return (exists as { id: string }).id;
  const columns = Object.keys(data);
  const values = columns.map((column) => data[column]);
  const placeholders = columns.map(() => "?").join(", ");
  db.prepare(`INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`).run(...values);
  return String(data.id);
}

export function ensureDatabase() {
  mkdirSync(dirname(dbPath), { recursive: true });
  const firstRun = !existsSync(dbPath);
  const db = new DatabaseSync(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS Region (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      language TEXT NOT NULL,
      style TEXT NOT NULL,
      learningLibrary TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Account (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      regionId TEXT NOT NULL,
      phoneNo TEXT NOT NULL DEFAULT '',
      positioning TEXT NOT NULL DEFAULT '',
      mainProduct TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT '正常',
      publishStrategy TEXT NOT NULL DEFAULT '',
      dailyPostTarget INTEGER NOT NULL DEFAULT 1,
      styleNotes TEXT NOT NULL DEFAULT '',
      riskNotes TEXT NOT NULL DEFAULT '',
      latestReview TEXT NOT NULL DEFAULT '',
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Product (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      regionIds TEXT NOT NULL DEFAULT '',
      accountIds TEXT NOT NULL DEFAULT '',
      sellingPoints TEXT NOT NULL DEFAULT '',
      emotionalPoints TEXT NOT NULL DEFAULT '',
      audience TEXT NOT NULL DEFAULT '',
      scenes TEXT NOT NULL DEFAULT '',
      videoStyles TEXT NOT NULL DEFAULT '',
      hooks TEXT NOT NULL DEFAULT '',
      titleDirections TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT '',
      cta TEXT NOT NULL DEFAULT '',
      imageNotes TEXT NOT NULL DEFAULT '',
      materialStatus TEXT NOT NULL DEFAULT '待整理',
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Video (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      regionId TEXT NOT NULL,
      accountId TEXT NOT NULL,
      productId TEXT NOT NULL,
      videoType TEXT NOT NULL DEFAULT 'AI视频',
      status TEXT NOT NULL DEFAULT '选题中',
      publishedAt DATETIME,
      videoUrl TEXT NOT NULL DEFAULT '',
      materialNotes TEXT NOT NULL DEFAULT '',
      hook TEXT NOT NULL DEFAULT '',
      voiceover TEXT NOT NULL DEFAULT '',
      chineseVoiceover TEXT NOT NULL DEFAULT '',
      pov TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL DEFAULT '',
      subtitle TEXT NOT NULL DEFAULT '',
      caption TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT '',
      cta TEXT NOT NULL DEFAULT '',
      elevenLabsText TEXT NOT NULL DEFAULT '',
      libtvStoryboard TEXT NOT NULL DEFAULT '',
      libtvFirstFramePrompt TEXT NOT NULL DEFAULT '',
      libtvLastFramePrompt TEXT NOT NULL DEFAULT '',
      libtvPrompt TEXT NOT NULL DEFAULT '',
      competitorSource TEXT NOT NULL DEFAULT '',
      replicationNotes TEXT NOT NULL DEFAULT '',
      views INTEGER NOT NULL DEFAULT 0,
      likes INTEGER NOT NULL DEFAULT 0,
      comments INTEGER NOT NULL DEFAULT 0,
      saves INTEGER NOT NULL DEFAULT 0,
      shares INTEGER NOT NULL DEFAULT 0,
      completionRate REAL NOT NULL DEFAULT 0,
      clickRate REAL NOT NULL DEFAULT 0,
      productClicks INTEGER NOT NULL DEFAULT 0,
      orders INTEGER NOT NULL DEFAULT 0,
      gmv REAL NOT NULL DEFAULT 0,
      newFollowers INTEGER NOT NULL DEFAULT 0,
      data24h TEXT NOT NULL DEFAULT '',
      data48h TEXT NOT NULL DEFAULT '',
      data72h TEXT NOT NULL DEFAULT '',
      rating TEXT NOT NULL DEFAULT '普通',
      successReason TEXT NOT NULL DEFAULT '',
      failureReason TEXT NOT NULL DEFAULT '',
      nextIteration TEXT NOT NULL DEFAULT '',
      canReplicateProduct BOOLEAN NOT NULL DEFAULT false,
      canReplicateRegion BOOLEAN NOT NULL DEFAULT false,
      addToTemplate BOOLEAN NOT NULL DEFAULT false,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Competitor (
      id TEXT PRIMARY KEY NOT NULL,
      accountName TEXT NOT NULL,
      regionId TEXT NOT NULL,
      accountUrl TEXT NOT NULL DEFAULT '',
      videoUrl TEXT NOT NULL DEFAULT '',
      videoTitle TEXT NOT NULL DEFAULT '',
      transcript TEXT NOT NULL DEFAULT '',
      visualDescription TEXT NOT NULL DEFAULT '',
      commentSummary TEXT NOT NULL DEFAULT '',
      productType TEXT NOT NULL DEFAULT '',
      viralAnalysis TEXT NOT NULL DEFAULT '',
      learnings TEXT NOT NULL DEFAULT '',
      replicablePoints TEXT NOT NULL DEFAULT '',
      avoidPoints TEXT NOT NULL DEFAULT '',
      hookBreakdown TEXT NOT NULL DEFAULT '',
      voiceoverBreakdown TEXT NOT NULL DEFAULT '',
      rhythmBreakdown TEXT NOT NULL DEFAULT '',
      titleBreakdown TEXT NOT NULL DEFAULT '',
      tagsBreakdown TEXT NOT NULL DEFAULT '',
      localVersion TEXT NOT NULL DEFAULT '',
      languageVersion TEXT NOT NULL DEFAULT '',
      chineseExplanation TEXT NOT NULL DEFAULT '',
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ViralTemplate (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      sourceVideo TEXT NOT NULL DEFAULT '',
      regionIds TEXT NOT NULL DEFAULT '',
      accountIds TEXT NOT NULL DEFAULT '',
      productIds TEXT NOT NULL DEFAULT '',
      hookStructure TEXT NOT NULL DEFAULT '',
      middleStructure TEXT NOT NULL DEFAULT '',
      endingStructure TEXT NOT NULL DEFAULT '',
      titleStructure TEXT NOT NULL DEFAULT '',
      tagsStructure TEXT NOT NULL DEFAULT '',
      storyboardStructure TEXT NOT NULL DEFAULT '',
      replaceableProducts TEXT NOT NULL DEFAULT '',
      regionReplication TEXT NOT NULL DEFAULT '',
      cautions TEXT NOT NULL DEFAULT '',
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS LibTVWorkflow (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      productId TEXT NOT NULL DEFAULT '',
      accountId TEXT NOT NULL DEFAULT '',
      videoStyle TEXT NOT NULL DEFAULT '',
      shotCount INTEGER NOT NULL DEFAULT 8,
      secondsPerShot REAL NOT NULL DEFAULT 1.8,
      visualConsistency TEXT NOT NULL DEFAULT '',
      productConsistency TEXT NOT NULL DEFAULT '',
      firstFramePrompt TEXT NOT NULL DEFAULT '',
      lastFramePrompt TEXT NOT NULL DEFAULT '',
      masterPrompt TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS CalendarItem (
      id TEXT PRIMARY KEY NOT NULL,
      date DATETIME NOT NULL,
      regionId TEXT NOT NULL,
      accountId TEXT NOT NULL,
      productId TEXT NOT NULL,
      topic TEXT NOT NULL,
      videoStatus TEXT NOT NULL DEFAULT '选题中',
      publishTime TEXT NOT NULL DEFAULT '',
      published BOOLEAN NOT NULL DEFAULT false,
      needsReview BOOLEAN NOT NULL DEFAULT true,
      reviewReminder TEXT NOT NULL DEFAULT '',
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL
    );
  `);

  const regionCount = db.prepare("SELECT COUNT(*) as count FROM Region").get() as { count: number };
  if (!firstRun && regionCount.count > 0) {
    db.close();
    return;
  }

  const timestamp = now();
  const usId = insertIfMissing(db, "Region", "code", "US", {
    id: "region_us",
    name: "美区",
    code: "US",
    language: "英文 + 中文解释",
    style: "节奏快、钩子强、直接，适合 TikTok 带货。",
    learningLibrary: "保存美区爆款标题、强钩子、短口播和转化型 CTA。",
    notes: "",
    createdAt: timestamp,
    updatedAt: timestamp
  });
  const ukId = insertIfMissing(db, "Region", "code", "UK", {
    id: "region_uk",
    name: "英区",
    code: "UK",
    language: "英文 + 中文解释",
    style: "自然、克制、真实生活感，避免美式浮夸。",
    learningLibrary: "保存英国账号的生活感开头、轻种草表达和评论反馈。",
    notes: "",
    createdAt: timestamp,
    updatedAt: timestamp
  });
  const mxId = insertIfMissing(db, "Region", "code", "MX", {
    id: "region_mx",
    name: "墨西哥区",
    code: "MX",
    language: "墨西哥西班牙语 + 中文解释",
    style: "更情绪化、更热、更贴近墨西哥用户，避免机器翻译腔。",
    learningLibrary: "保存墨西哥西语表达、情绪钩子、产品定位和对标账号。",
    notes: "",
    createdAt: timestamp,
    updatedAt: timestamp
  });

  const accounts = [
    ["account_cherry", "Cherry 手机44号 宗教", usId, "44", "宗教饰品、十字架、信念感佩戴氛围", "镶钻十字架 / 圣母耶稣项链"],
    ["account_jeroioo", "Jeroioo 手机33号 数字", usId, "33", "个性化数字、字母和纪念意义饰品", "镶钻数字项链 / 字母项链"],
    ["account_katiioo", "Katiioo 手机45号 手部", ukId, "45", "手链、手镯、睡前佩戴和女性手饰", "手链 / 手镯"],
    ["account_ella", "Ella 手机22号 地图", mxId, "22", "国家身份、家乡属性、距离感和 country pride", "国家地图项链"]
  ];

  for (const account of accounts) {
    insertIfMissing(db, "Account", "name", String(account[1]), {
      id: account[0],
      name: account[1],
      regionId: account[2],
      phoneNo: account[3],
      positioning: account[4],
      mainProduct: account[5],
      status: "正常",
      publishStrategy: "优先测试当地晚间高活跃时段，保留 24h/48h/72h 数据。",
      dailyPostTarget: 2,
      styleNotes: "短口播、强钩子、产品近景、结尾软性下单引导。",
      riskNotes: "",
      latestReview: "MVP 初始账号，等待录入首批视频数据。",
      createdAt: timestamp,
      updatedAt: timestamp
    });
  }

  const categories = ["镶钻数字项链", "字母项链", "国家地图项链", "镶钻十字架", "多巴胺十字架", "贝壳十字架", "圣母耶稣项链", "手链", "手镯", "耳环 / 耳饰", "定制礼品", "其他 AI 带货产品"];
  for (const [index, category] of categories.entries()) {
    insertIfMissing(db, "Product", "name", category, {
      id: `product_${index + 1}`,
      name: category,
      category,
      regionIds: [usId, ukId, mxId].join(","),
      accountIds: "",
      sellingPoints: "可定制、适合短视频近景展示、礼物属性强。",
      emotionalPoints: "身份感、纪念意义、信念感或日常陪伴感。",
      audience: "TikTok 饰品兴趣用户、礼物购买人群、个性化饰品用户。",
      scenes: "上身近景、房间灯、礼物拆封、睡前氛围、日常穿搭。",
      videoStyles: "实拍 / UGC / AI 视频 / LibTV 分镜",
      hooks: "I did not expect this little piece to feel so personal.",
      titleDirections: "身份感 + 产品关键词 + 软性情绪",
      tags: "#customjewelry #tiktokshop #giftideas #necklace",
      cta: "If it feels like your story, save it for later.",
      imageNotes: "",
      materialStatus: "待整理",
      createdAt: timestamp,
      updatedAt: timestamp
    });
  }

  insertIfMissing(db, "Video", "name", "地图项链身份感测试脚本", {
    id: "video_map_identity",
    name: "地图项链身份感测试脚本",
    regionId: mxId,
    accountId: "account_ella",
    productId: "product_3",
    videoType: "LibTV生成",
    status: "脚本完成",
    publishedAt: null,
    videoUrl: "",
    materialNotes: "",
    hook: "When home is far away, a tiny map can still feel close.",
    voiceover: "When home is far away, wearing a tiny map makes it feel a little closer. It is simple, personal, and easy to keep with you every day. Save this if it feels like your story.",
    chineseVoiceover: "当家乡很远的时候，一条小小的地图项链会让距离感变近。它简单、个人化，也适合每天戴着。如果这像你的故事，可以先收藏。",
    pov: "",
    title: "A tiny map for the place that made you",
    subtitle: "home, but closer",
    caption: "For anyone carrying a little piece of home with them.",
    tags: "#mapnecklace #customgift #countrypride #tiktokshop",
    cta: "Save this if it feels like your story.",
    elevenLabsText: "When home is far away, wearing a tiny map makes it feel a little closer. It is simple, personal, and easy to keep with you every day. Save this if it feels like your story.",
    libtvStoryboard: "1. 近景展示项链轮廓\n2. 手指轻触地图吊坠\n3. 佩戴上身领口近景\n4. 房间灯下微闪\n5. 礼物盒打开\n6. 手机地图画面虚焦\n7. 主体近景旋转\n8. 结尾定格产品",
    libtvFirstFramePrompt: "",
    libtvLastFramePrompt: "",
    libtvPrompt: "9:16 vertical, realistic jewelry close-up, no text, no subtitles, no logo, consistent necklace design, warm room light.",
    competitorSource: "",
    replicationNotes: "",
    views: 0,
    likes: 0,
    comments: 0,
    saves: 0,
    shares: 0,
    completionRate: 0,
    clickRate: 0,
    productClicks: 0,
    orders: 0,
    gmv: 0,
    newFollowers: 0,
    data24h: "",
    data48h: "",
    data72h: "",
    rating: "可优化",
    successReason: "",
    failureReason: "",
    nextIteration: "补充墨西哥西语版本，测试更强的家乡情绪开头。",
    canReplicateProduct: 0,
    canReplicateRegion: 0,
    addToTemplate: 0,
    createdAt: timestamp,
    updatedAt: timestamp
  });

  db.close();
}

if (process.argv[1]?.replaceAll("\\", "/").endsWith("/server/db-init.ts")) {
  ensureDatabase();
  console.log(`SQLite database is ready at ${dbPath}`);
}
