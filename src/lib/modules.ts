import {
  BarChart3,
  CalendarDays,
  Clapperboard,
  CopyCheck,
  Database,
  Film,
  Globe2,
  LayoutDashboard,
  LibraryBig,
  Package,
  Settings,
  Sparkles,
  UsersRound,
  Wand2
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Option = { label: string; value: string };
export type Lookup = {
  regions: AnyRow[];
  accounts: AnyRow[];
  products: AnyRow[];
};
export type AnyRow = Record<string, any>;

export type Field = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select" | "date" | "datetime" | "checkbox";
  options?: Option[] | ((lookup: Lookup) => Option[]);
  placeholder?: string;
  table?: boolean;
  copy?: boolean;
  required?: boolean;
};

export type ModuleConfig = {
  key: string;
  path: string;
  title: string;
  description: string;
  icon: LucideIcon;
  resource?: string;
  fields?: Field[];
  searchHint?: string;
};

export const accountStatuses = ["正常", "测试中", "限流", "封禁", "申诉中", "停用"];
export const productCategories = [
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
export const videoTypes = ["实拍", "AI视频", "UGC", "剧情", "对标复刻", "LibTV生成", "产品展示"];
export const videoStatuses = ["选题中", "脚本完成", "已生成", "已发布", "待复盘", "已淘汰", "可复用"];
export const videoRatings = ["爆款", "可优化", "普通", "失败"];

const optionFrom = (rows: AnyRow[], fallback: string) =>
  rows.length
    ? rows.map((row) => ({ label: row.name ?? row.accountName ?? fallback, value: row.id }))
    : [{ label: fallback, value: "" }];

export const regionOptions = (lookup: Lookup) => optionFrom(lookup.regions, "先创建地区");
export const accountOptions = (lookup: Lookup) => optionFrom(lookup.accounts, "先创建账号");
export const productOptions = (lookup: Lookup) => optionFrom(lookup.products, "先创建产品");
export const staticOptions = (items: string[]) => items.map((item) => ({ label: item, value: item }));

export const modules: ModuleConfig[] = [
  {
    key: "dashboard",
    path: "/dashboard",
    title: "总览",
    description: "查看账号、产品、视频、GMV 和待复盘内容的整体状态。",
    icon: LayoutDashboard
  },
  {
    key: "regions",
    path: "/regions",
    title: "地区管理",
    description: "为 US / UK / MX 建立独立内容学习库、语言和风格规则。",
    icon: Globe2,
    resource: "regions",
    searchHint: "搜索地区、语言、风格",
    fields: [
      { name: "name", label: "地区名称", required: true, table: true },
      { name: "code", label: "地区代码", required: true, table: true },
      { name: "language", label: "语言", table: true },
      { name: "style", label: "内容风格", type: "textarea", table: true },
      { name: "learningLibrary", label: "内容学习库", type: "textarea", copy: true },
      { name: "notes", label: "备注", type: "textarea" }
    ]
  },
  {
    key: "accounts",
    path: "/accounts",
    title: "账号管理",
    description: "管理不同手机账号、账号定位、状态、发布策略和复盘结论。",
    icon: UsersRound,
    resource: "accounts",
    searchHint: "搜索账号、定位、状态",
    fields: [
      { name: "name", label: "账号名称", required: true, table: true },
      { name: "regionId", label: "所属地区", type: "select", options: regionOptions, table: true },
      { name: "phoneNo", label: "手机编号", table: true },
      { name: "positioning", label: "账号定位", type: "textarea", table: true },
      { name: "mainProduct", label: "主推产品", table: true },
      { name: "status", label: "账号状态", type: "select", options: staticOptions(accountStatuses), table: true },
      { name: "publishStrategy", label: "发布时间策略", type: "textarea" },
      { name: "dailyPostTarget", label: "每日建议发布数", type: "number", table: true },
      { name: "styleNotes", label: "内容风格备注", type: "textarea" },
      { name: "riskNotes", label: "风险备注", type: "textarea" },
      { name: "latestReview", label: "最近复盘结论", type: "textarea", copy: true }
    ]
  },
  {
    key: "products",
    path: "/products",
    title: "产品库",
    description: "沉淀产品分类、卖点、情绪卖点、常用 Hook、标题方向和 Tags。",
    icon: Package,
    resource: "products",
    searchHint: "搜索产品、分类、卖点、Tags",
    fields: [
      { name: "name", label: "产品名称", required: true, table: true },
      { name: "category", label: "产品分类", type: "select", options: staticOptions(productCategories), table: true },
      { name: "regionIds", label: "适合地区 ID", placeholder: "多个 ID 用英文逗号分隔" },
      { name: "accountIds", label: "适合账号 ID", placeholder: "多个 ID 用英文逗号分隔" },
      { name: "sellingPoints", label: "产品卖点", type: "textarea", table: true, copy: true },
      { name: "emotionalPoints", label: "情绪卖点", type: "textarea" },
      { name: "audience", label: "适合人群", type: "textarea" },
      { name: "scenes", label: "适合场景", type: "textarea" },
      { name: "videoStyles", label: "适合视频风格", type: "textarea" },
      { name: "hooks", label: "常用 Hook", type: "textarea", copy: true },
      { name: "titleDirections", label: "常用标题方向", type: "textarea" },
      { name: "tags", label: "常用 Tags", type: "textarea", table: true, copy: true },
      { name: "cta", label: "常用下单引导", type: "textarea", copy: true },
      { name: "imageNotes", label: "产品图片备注", type: "textarea" },
      { name: "materialStatus", label: "素材状态", table: true }
    ]
  },
  {
    key: "videos",
    path: "/videos",
    title: "视频内容库",
    description: "管理每条视频的脚本、标题、简介、Tags、LibTV、ElevenLabs 和数据复盘。",
    icon: Film,
    resource: "videos",
    searchHint: "搜索视频、Hook、标题、Tags、评级",
    fields: [
      { name: "name", label: "视频名称", required: true, table: true },
      { name: "regionId", label: "所属地区", type: "select", options: regionOptions, table: true },
      { name: "accountId", label: "所属账号", type: "select", options: accountOptions, table: true },
      { name: "productId", label: "关联产品", type: "select", options: productOptions, table: true },
      { name: "videoType", label: "视频类型", type: "select", options: staticOptions(videoTypes), table: true },
      { name: "status", label: "视频状态", type: "select", options: staticOptions(videoStatuses), table: true },
      { name: "publishedAt", label: "发布时间", type: "datetime" },
      { name: "videoUrl", label: "视频链接" },
      { name: "materialNotes", label: "素材备注", type: "textarea" },
      { name: "hook", label: "Hook", type: "textarea", copy: true },
      { name: "voiceover", label: "Voiceover", type: "textarea", table: true, copy: true },
      { name: "chineseVoiceover", label: "中文口播", type: "textarea", copy: true },
      { name: "pov", label: "POV", type: "textarea", copy: true },
      { name: "title", label: "TikTok Title", type: "textarea", table: true, copy: true },
      { name: "subtitle", label: "视频内小标题", type: "textarea", copy: true },
      { name: "caption", label: "Caption / 简介", type: "textarea", copy: true },
      { name: "tags", label: "Tags", type: "textarea", table: true, copy: true },
      { name: "cta", label: "结尾下单引导", type: "textarea", copy: true },
      { name: "elevenLabsText", label: "ElevenLabs 配音文本", type: "textarea", copy: true },
      { name: "libtvStoryboard", label: "LibTV 分镜", type: "textarea", copy: true },
      { name: "libtvFirstFramePrompt", label: "LibTV 首帧提示词", type: "textarea", copy: true },
      { name: "libtvLastFramePrompt", label: "LibTV 尾帧提示词", type: "textarea", copy: true },
      { name: "libtvPrompt", label: "LibTV 总提示词", type: "textarea", copy: true },
      { name: "competitorSource", label: "对标来源", type: "textarea" },
      { name: "replicationNotes", label: "复刻说明", type: "textarea" },
      { name: "views", label: "播放量", type: "number", table: true },
      { name: "likes", label: "点赞", type: "number" },
      { name: "comments", label: "评论", type: "number" },
      { name: "saves", label: "收藏", type: "number" },
      { name: "shares", label: "分享", type: "number" },
      { name: "completionRate", label: "完播率 %", type: "number", table: true },
      { name: "clickRate", label: "点击率 %", type: "number", table: true },
      { name: "productClicks", label: "商品点击", type: "number" },
      { name: "orders", label: "成交件数", type: "number", table: true },
      { name: "gmv", label: "GMV", type: "number", table: true },
      { name: "newFollowers", label: "新增粉丝", type: "number" },
      { name: "data24h", label: "24h 数据", type: "textarea" },
      { name: "data48h", label: "48h 数据", type: "textarea" },
      { name: "data72h", label: "72h 数据", type: "textarea" },
      { name: "rating", label: "视频评级", type: "select", options: staticOptions(videoRatings), table: true },
      { name: "successReason", label: "成功原因", type: "textarea" },
      { name: "failureReason", label: "失败原因", type: "textarea" },
      { name: "nextIteration", label: "下次迭代方向", type: "textarea", copy: true },
      { name: "canReplicateProduct", label: "可换产品复刻", type: "checkbox" },
      { name: "canReplicateRegion", label: "可换地区复刻", type: "checkbox" },
      { name: "addToTemplate", label: "加入爆款模板库", type: "checkbox" }
    ]
  },
  {
    key: "analytics",
    path: "/analytics",
    title: "数据复盘",
    description: "根据播放、完播、点击、成交和 GMV 自动给出基础判断。",
    icon: BarChart3
  },
  {
    key: "competitors",
    path: "/competitors",
    title: "对标账号分析",
    description: "手动录入对标视频，拆解钩子、口播、节奏、标题和可复刻点。",
    icon: CopyCheck,
    resource: "competitors",
    searchHint: "搜索对标账号、标题、爆点、可学习点",
    fields: [
      { name: "accountName", label: "对标账号名称", required: true, table: true },
      { name: "regionId", label: "所属地区", type: "select", options: regionOptions, table: true },
      { name: "accountUrl", label: "账号链接" },
      { name: "videoUrl", label: "视频链接" },
      { name: "videoTitle", label: "视频标题", table: true },
      { name: "transcript", label: "视频转写文本", type: "textarea", copy: true },
      { name: "visualDescription", label: "画面描述", type: "textarea" },
      { name: "commentSummary", label: "评论区摘要", type: "textarea" },
      { name: "productType", label: "产品类型", table: true },
      { name: "viralAnalysis", label: "爆点分析", type: "textarea", table: true },
      { name: "learnings", label: "可学习点", type: "textarea", copy: true },
      { name: "replicablePoints", label: "可复刻点", type: "textarea" },
      { name: "avoidPoints", label: "不适合复刻点", type: "textarea" },
      { name: "hookBreakdown", label: "开头钩子拆解", type: "textarea", copy: true },
      { name: "voiceoverBreakdown", label: "口播结构拆解", type: "textarea" },
      { name: "rhythmBreakdown", label: "视频节奏拆解", type: "textarea" },
      { name: "titleBreakdown", label: "标题结构拆解", type: "textarea" },
      { name: "tagsBreakdown", label: "Tags 结构拆解", type: "textarea" },
      { name: "localVersion", label: "适合我方账号的复刻版本", type: "textarea", copy: true },
      { name: "languageVersion", label: "对应地区语言版本", type: "textarea", copy: true },
      { name: "chineseExplanation", label: "中文解释版本", type: "textarea", copy: true }
    ]
  },
  {
    key: "generator",
    path: "/generator",
    title: "内容生成器",
    description: "第一版使用本地规则模拟输出，后续可接 OpenAI API。",
    icon: Wand2
  },
  {
    key: "templates",
    path: "/templates",
    title: "爆款模板库",
    description: "把高 GMV 或可复刻的视频沉淀成结构化模板。",
    icon: LibraryBig,
    resource: "templates",
    searchHint: "搜索模板、结构、注意事项",
    fields: [
      { name: "name", label: "模板名称", required: true, table: true },
      { name: "sourceVideo", label: "来源视频", table: true },
      { name: "regionIds", label: "适合地区 ID" },
      { name: "accountIds", label: "适合账号 ID" },
      { name: "productIds", label: "适合产品 ID" },
      { name: "hookStructure", label: "开头结构", type: "textarea", table: true, copy: true },
      { name: "middleStructure", label: "中段结构", type: "textarea" },
      { name: "endingStructure", label: "结尾结构", type: "textarea" },
      { name: "titleStructure", label: "标题结构", type: "textarea", copy: true },
      { name: "tagsStructure", label: "Tags 结构", type: "textarea", copy: true },
      { name: "storyboardStructure", label: "分镜结构", type: "textarea", copy: true },
      { name: "replaceableProducts", label: "可替换产品", type: "textarea" },
      { name: "regionReplication", label: "可换地区复刻", type: "textarea" },
      { name: "cautions", label: "注意事项", type: "textarea" }
    ]
  },
  {
    key: "libtv",
    path: "/libtv",
    title: "LibTV 工作流",
    description: "保存分镜、首尾帧提示词、9:16 竖屏要求和产品替换规则。",
    icon: Clapperboard,
    resource: "libtv",
    searchHint: "搜索工作流、视频风格、提示词",
    fields: [
      { name: "name", label: "工作流名称", required: true, table: true },
      { name: "productId", label: "所属产品", type: "select", options: productOptions, table: true },
      { name: "accountId", label: "所属账号", type: "select", options: accountOptions, table: true },
      { name: "videoStyle", label: "视频风格", table: true },
      { name: "shotCount", label: "分镜数量", type: "number", table: true },
      { name: "secondsPerShot", label: "每镜头时长", type: "number" },
      { name: "visualConsistency", label: "画面统一性要求", type: "textarea" },
      { name: "productConsistency", label: "产品统一性要求", type: "textarea" },
      { name: "firstFramePrompt", label: "首帧提示词", type: "textarea", copy: true },
      { name: "lastFramePrompt", label: "尾帧提示词", type: "textarea", copy: true },
      { name: "masterPrompt", label: "总提示词", type: "textarea", copy: true },
      { name: "notes", label: "备注", type: "textarea" }
    ]
  },
  {
    key: "calendar",
    path: "/calendar",
    title: "内容日历",
    description: "安排每天发什么、什么时候发、是否需要复盘提醒。",
    icon: CalendarDays,
    resource: "calendar",
    searchHint: "搜索主题、状态、提醒",
    fields: [
      { name: "date", label: "日期", type: "date", required: true, table: true },
      { name: "regionId", label: "地区", type: "select", options: regionOptions, table: true },
      { name: "accountId", label: "账号", type: "select", options: accountOptions, table: true },
      { name: "productId", label: "产品", type: "select", options: productOptions, table: true },
      { name: "topic", label: "视频主题", required: true, table: true },
      { name: "videoStatus", label: "视频状态", type: "select", options: staticOptions(videoStatuses), table: true },
      { name: "publishTime", label: "发布时间", table: true },
      { name: "published", label: "是否已发布", type: "checkbox", table: true },
      { name: "needsReview", label: "是否需要复盘", type: "checkbox", table: true },
      { name: "reviewReminder", label: "复盘提醒", type: "textarea" }
    ]
  },
  {
    key: "settings",
    path: "/settings",
    title: "设置",
    description: "本地运行、数据路径、OpenAI API 预留和文案规则说明。",
    icon: Settings
  }
];

export const extraNav = [
  { title: "文案规则库", icon: Sparkles },
  { title: "本地数据库", icon: Database }
];

export function currentModule(pathname: string) {
  if (pathname === "/") return modules[0];
  return modules.find((item) => item.path === pathname) ?? modules[0];
}

export function displayValue(field: Field, value: unknown, lookup: Lookup) {
  if (field.type === "checkbox") return value ? "是" : "否";
  if (field.type === "select" && field.options) {
    const options = typeof field.options === "function" ? field.options(lookup) : field.options;
    return options.find((item) => item.value === value)?.label ?? String(value ?? "");
  }
  if (field.type === "date" || field.type === "datetime") {
    if (!value) return "";
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return String(value);
    return field.type === "date" ? date.toLocaleDateString("zh-CN") : date.toLocaleString("zh-CN");
  }
  return String(value ?? "");
}
