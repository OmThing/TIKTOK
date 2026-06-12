import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Film,
  Globe2,
  Package,
  Search,
  Sparkles,
  UsersRound
} from "lucide-react";
import { useMemo, useState } from "react";
import { analyzeVideo } from "../lib/analysis";
import { displayValue, type Lookup } from "../lib/modules";

type DashboardProps = {
  data: {
    regions: any[];
    accounts: any[];
    products: any[];
    videos: any[];
    competitors: any[];
    templates: any[];
    libtv: any[];
    calendar: any[];
  };
  lookup: Lookup;
  navigate: (path: string) => void;
};

type SearchResult = {
  type: string;
  title: string;
  description: string;
  path: string;
  query: string;
};

function encodeQuery(value: string) {
  return encodeURIComponent(value.trim());
}

function getName(rows: any[], id: string) {
  return rows.find((row) => row.id === id)?.name ?? "";
}

export function Dashboard({ data, lookup, navigate }: DashboardProps) {
  const [search, setSearch] = useState("");
  const totalGmv = data.videos.reduce((sum, video) => sum + Number(video.gmv ?? 0), 0);
  const published = data.videos.filter((video) => video.status === "已发布").length;
  const needsReview = data.videos.filter((video) => video.status === "待复盘" || video.rating === "可优化").length;
  const recentVideos = data.videos.slice(0, 5);
  const activeAccounts = data.accounts.filter((account) => account.status === "正常").length;

  const stats = [
    { label: "地区档案", value: data.regions.length, icon: Globe2, path: "/regions" },
    { label: "账号档案", value: data.accounts.length, icon: UsersRound, path: "/accounts" },
    { label: "产品样本", value: data.products.length, icon: Package, path: "/products" },
    { label: "视频脚本", value: data.videos.length, icon: Film, path: "/videos" },
    { label: "已发布", value: published, icon: CheckCircle2, path: "/videos?q=已发布" },
    { label: "待复盘", value: needsReview, icon: Clock3, path: "/analytics" }
  ];

  const searchResults = useMemo<SearchResult[]>(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return [];

    const matches = (values: unknown[]) => values.some((value) => String(value ?? "").toLowerCase().includes(keyword));
    const results: SearchResult[] = [];

    for (const account of data.accounts) {
      if (matches([account.name, account.positioning, account.mainProduct, account.latestReview])) {
        results.push({
          type: "账号",
          title: account.name,
          description: account.positioning || account.mainProduct || "账号档案",
          path: "/videos",
          query: account.name
        });
      }
    }

    for (const product of data.products) {
      if (matches([product.name, product.category, product.sellingPoints, product.tags])) {
        results.push({
          type: "产品",
          title: product.name,
          description: product.sellingPoints || product.category,
          path: "/videos",
          query: product.name
        });
      }
    }

    for (const video of data.videos) {
      const accountName = getName(data.accounts, video.accountId);
      const productName = getName(data.products, video.productId);
      if (matches([video.name, video.title, video.hook, video.tags, accountName, productName])) {
        results.push({
          type: "视频",
          title: video.name,
          description: video.title || video.hook || "视频内容库",
          path: "/videos",
          query: video.name
        });
      }
    }

    for (const competitor of data.competitors) {
      if (matches([competitor.accountName, competitor.videoTitle, competitor.viralAnalysis, competitor.learnings])) {
        results.push({
          type: "对标",
          title: competitor.accountName,
          description: competitor.videoTitle || competitor.viralAnalysis || "对标账号分析",
          path: "/competitors",
          query: competitor.accountName
        });
      }
    }

    for (const template of data.templates) {
      if (matches([template.name, template.hookStructure, template.titleStructure, template.tagsStructure])) {
        results.push({
          type: "模板",
          title: template.name,
          description: template.hookStructure || template.titleStructure || "爆款模板库",
          path: "/templates",
          query: template.name
        });
      }
    }

    return results.slice(0, 8);
  }, [data, search]);

  return (
    <div className="space-y-6">
      <div className="overview-band yummy-archive">
        <div>
          <p className="section-kicker">TikTok Content Research Archive</p>
          <h2>TK Content Growth OS</h2>
          <p>
            把账号、产品、脚本、LibTV 分镜、ElevenLabs 口播和数据复盘放进一个本地档案台。每张卡片都能进入对应内容，不再只是摆着好看。
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button className="seal-button" onClick={() => navigate("/generator")}>
              <Sparkles size={15} />
              生成新脚本
            </button>
            <button className="paper-button" onClick={() => navigate("/videos")}>
              <Film size={15} />
              打开视频库
            </button>
          </div>
        </div>
        <button className="metric-highlight interactive" onClick={() => navigate("/analytics")}>
          <span>累计 GMV</span>
          <strong>${totalGmv.toFixed(2)}</strong>
          <small>{activeAccounts} 个正常账号 · {needsReview} 条待复盘</small>
        </button>
      </div>

      <section className="panel archive-search">
        <div className="panel-heading row">
          <div>
            <h3>本地内容检索</h3>
            <span>搜索本地账号、产品、视频、对标和模板，点击结果直接进入对应板块。</span>
          </div>
          <div className="local-search-box">
            <Search size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="试试搜索 Cherry、地图项链、Tags、Hook..."
            />
          </div>
        </div>
        <div className="search-result-grid">
          {searchResults.map((result) => (
            <button
              className="archive-result"
              key={`${result.type}-${result.title}`}
              onClick={() => navigate(`${result.path}?q=${encodeQuery(result.query)}`)}
            >
              <span>{result.type}</span>
              <strong>{result.title}</strong>
              <small>{result.description}</small>
              <ArrowRight size={16} />
            </button>
          ))}
          {search && !searchResults.length && <div className="empty-state">本地库里还没有匹配内容，可以先去对应板块新增。</div>}
          {!search && (
            <div className="search-placeholder">
              <span className="mini-seal">TK</span>
              <p>这是本地搜索，不调用外部平台。数据来自你手动录入的账号、产品、脚本、模板和对标记录。</p>
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <button className="stat-card clickable" key={item.label} onClick={() => navigate(item.path)}>
              <Icon size={19} />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="panel">
          <div className="panel-heading row">
            <div>
              <h3>账号内容入口</h3>
              <span>点击账号进入该账号的视频内容筛选；也可以打开账号档案。</span>
            </div>
            <button className="paper-button" onClick={() => navigate("/accounts")}>
              全部账号
            </button>
          </div>
          <div className="account-grid">
            {data.accounts.map((account) => {
              const videos = data.videos.filter((video) => video.accountId === account.id);
              const accountGmv = videos.reduce((sum, video) => sum + Number(video.gmv ?? 0), 0);
              return (
                <article className="account-dossier" key={account.id}>
                  <button className="account-main" onClick={() => navigate(`/videos?q=${encodeQuery(account.name)}`)}>
                    <span>{account.status}</span>
                    <strong>{account.name}</strong>
                    <small>{account.positioning || account.mainProduct}</small>
                    <div>
                      <b>{videos.length}</b> 条视频 · <b>${accountGmv.toFixed(2)}</b> GMV
                    </div>
                  </button>
                  <button className="text-link" onClick={() => navigate(`/accounts?q=${encodeQuery(account.name)}`)}>
                    查看账号档案
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading row">
            <div>
              <h3>产品内容入口</h3>
              <span>从产品分类进入对应视频或产品档案。</span>
            </div>
            <button className="paper-button" onClick={() => navigate("/products")}>
              产品库
            </button>
          </div>
          <div className="product-chip-grid">
            {data.products.slice(0, 12).map((product) => (
              <button
                className="product-chip"
                key={product.id}
                onClick={() => navigate(`/videos?q=${encodeQuery(product.name)}`)}
              >
                <span>{product.category}</span>
                <strong>{product.name}</strong>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="panel">
          <div className="panel-heading">
            <h3>最近视频</h3>
            <span>点击视频进入视频内容库并定位筛选。</span>
          </div>
          <div className="space-y-3">
            {recentVideos.map((video) => {
              const insight = analyzeVideo(video);
              return (
                <button className="row-card clickable-row" key={video.id} onClick={() => navigate(`/videos?q=${encodeQuery(video.name)}`)}>
                  <div className="min-w-0 text-left">
                    <div className="font-semibold">{video.name}</div>
                    <div className="mt-1 text-sm text-ink/55">
                      {displayValue(
                        {
                          name: "regionId",
                          label: "地区",
                          type: "select",
                          options: (l) => l.regions.map((r) => ({ label: r.name, value: r.id }))
                        },
                        video.regionId,
                        lookup
                      )}
                      {" · "}
                      {video.title || video.hook || "等待补充标题"}
                    </div>
                  </div>
                  <div className={`insight-pill ${insight.tone}`}>{insight.label}</div>
                </button>
              );
            })}
            {!recentVideos.length && <div className="empty-state">还没有视频，先去视频内容库新增第一条。</div>}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h3>内置文案规则</h3>
            <span>适合第一版内容生成器</span>
          </div>
          <ul className="rule-list">
            <li>Voiceover 默认 15 秒左右，适合 ElevenLabs 直接配音。</li>
            <li>不要动作说明、不要括号，Voiceover 不以 POV 开头。</li>
            <li>结尾必须带软性下单引导，并轮换表达。</li>
            <li>手链手镯不能宣称医疗功效，只表达舒适感和氛围感。</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
