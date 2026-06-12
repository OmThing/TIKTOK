import { Check, Copy, Save, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, apiSave, copyText } from "../lib/api";
import { generateContent } from "../lib/generator";
import { videoTypes, type Lookup } from "../lib/modules";

type GeneratorProps = {
  lookup: Lookup;
  onChanged: () => Promise<void>;
};

export function Generator({ lookup, onChanged }: GeneratorProps) {
  const [form, setForm] = useState({
    regionId: lookup.regions[0]?.id ?? "",
    accountId: lookup.accounts[0]?.id ?? "",
    productId: lookup.products[0]?.id ?? "",
    videoType: "AI视频",
    emotion: "身份感 / 纪念意义",
    duration: "15",
    useHistory: true,
    useCompetitor: false,
    useElevenLabs: true,
    useLibTV: true
  });
  const [saved, setSaved] = useState("");
  const [copied, setCopied] = useState("");
  const [aiStatus, setAiStatus] = useState({ configured: false, model: "deepseek-v4-flash", baseUrl: "https://api.deepseek.com" });
  const [aiOutput, setAiOutput] = useState<ReturnType<typeof generateContent> | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  const region = lookup.regions.find((item) => item.id === form.regionId) ?? lookup.regions[0];
  const account = lookup.accounts.find((item) => item.id === form.accountId) ?? lookup.accounts[0];
  const product = lookup.products.find((item) => item.id === form.productId) ?? lookup.products[0];

  const simulatedOutput = useMemo(
    () =>
      generateContent({
        regionName: region?.name ?? "美区",
        regionCode: region?.code ?? "US",
        regionStyle: region?.style ?? "",
        accountName: account?.name ?? "未选择账号",
        productName: product?.name ?? "未选择产品",
        productCategory: product?.category ?? "",
        productHooks: product?.hooks ?? "",
        productTags: product?.tags ?? "",
        videoType: form.videoType,
        emotion: form.emotion,
        duration: form.duration,
        useElevenLabs: form.useElevenLabs,
        useLibTV: form.useLibTV
      }),
    [account, form, product, region]
  );
  const output = aiOutput ?? simulatedOutput;

  useEffect(() => {
    apiGet<{ configured: boolean; model: string; baseUrl: string }>("/api/ai/status")
      .then(setAiStatus)
      .catch(() => setAiStatus({ configured: false, model: "deepseek-v4-flash", baseUrl: "https://api.deepseek.com" }));
  }, []);

  useEffect(() => {
    setAiOutput(null);
    setGenerateError("");
  }, [form, account?.id, product?.id, region?.id]);

  async function generateWithAi() {
    setGenerating(true);
    setGenerateError("");
    try {
      const result = await apiPost<ReturnType<typeof generateContent>>("/api/generator/deepseek", {
        regionName: region?.name ?? "美区",
        regionCode: region?.code ?? "US",
        regionLanguage: region?.language ?? "",
        regionStyle: region?.style ?? "",
        accountName: account?.name ?? "未选择账号",
        accountPositioning: account?.positioning ?? "",
        productName: product?.name ?? "未选择产品",
        productCategory: product?.category ?? "",
        sellingPoints: product?.sellingPoints ?? "",
        emotionalPoints: product?.emotionalPoints ?? "",
        productHooks: product?.hooks ?? "",
        productTags: product?.tags ?? "",
        videoType: form.videoType,
        emotion: form.emotion,
        duration: form.duration,
        useHistory: form.useHistory,
        useCompetitor: form.useCompetitor,
        useElevenLabs: form.useElevenLabs,
        useLibTV: form.useLibTV
      });
      setAiOutput(result);
    } catch (error) {
      setGenerateError(error instanceof Error ? error.message : "DeepSeek 生成失败");
    } finally {
      setGenerating(false);
    }
  }

  async function copyAll() {
    const text = Object.entries(output)
      .map(([key, value]) => `${key}\n${value}`)
      .join("\n\n");
    await copyText(text);
    setCopied("all");
    window.setTimeout(() => setCopied(""), 1200);
  }

  async function saveToVideo() {
    await apiSave("videos", {
      name: `${product?.name ?? "产品"} ${form.emotion} 脚本`,
      regionId: form.regionId,
      accountId: form.accountId,
      productId: form.productId,
      videoType: form.videoType,
      status: "脚本完成",
      hook: output.hook,
      voiceover: output.voiceover,
      chineseVoiceover: output.chineseVoiceover,
      pov: output.pov,
      title: output.title,
      subtitle: output.subtitle,
      caption: output.caption,
      tags: output.tags,
      cta: output.cta,
      elevenLabsText: output.elevenLabsText,
      libtvStoryboard: output.libtvStoryboard,
      nextIteration: output.iterationAdvice,
      rating: "普通"
    });
    setSaved("video");
    await onChanged();
  }

  async function saveToTemplate() {
    await apiSave("templates", {
      name: `${product?.name ?? "产品"} ${form.emotion} 模板`,
      regionIds: form.regionId,
      accountIds: form.accountId,
      productIds: form.productId,
      hookStructure: output.hook,
      middleStructure: output.voiceover,
      endingStructure: output.cta,
      titleStructure: output.title,
      tagsStructure: output.tags,
      storyboardStructure: output.libtvStoryboard,
      cautions: output.iterationAdvice
    });
    setSaved("template");
    await onChanged();
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <section className="panel">
        <div className="panel-heading">
          <h3>输入条件</h3>
          <span>可用本地规则模拟，也可调用 DeepSeek API 生成</span>
        </div>
        <div className="space-y-4">
          <GeneratorSelect
            label="地区"
            value={form.regionId}
            onChange={(value) => setForm({ ...form, regionId: value })}
            options={lookup.regions.map((item) => ({ label: `${item.name} ${item.code}`, value: item.id }))}
          />
          <GeneratorSelect
            label="账号"
            value={form.accountId}
            onChange={(value) => setForm({ ...form, accountId: value })}
            options={lookup.accounts.map((item) => ({ label: item.name, value: item.id }))}
          />
          <GeneratorSelect
            label="产品"
            value={form.productId}
            onChange={(value) => setForm({ ...form, productId: value })}
            options={lookup.products.map((item) => ({ label: item.name, value: item.id }))}
          />
          <GeneratorSelect
            label="视频类型"
            value={form.videoType}
            onChange={(value) => setForm({ ...form, videoType: value })}
            options={videoTypes.map((item) => ({ label: item, value: item }))}
          />
          <label className="field">
            <span>情绪方向</span>
            <input value={form.emotion} onChange={(event) => setForm({ ...form, emotion: event.target.value })} />
          </label>
          <label className="field">
            <span>口播时长</span>
            <input
              type="number"
              value={form.duration}
              onChange={(event) => setForm({ ...form, duration: event.target.value })}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Toggle label="参考历史爆款" value={form.useHistory} onChange={(value) => setForm({ ...form, useHistory: value })} />
            <Toggle
              label="参考对标视频"
              value={form.useCompetitor}
              onChange={(value) => setForm({ ...form, useCompetitor: value })}
            />
            <Toggle
              label="生成 ElevenLabs"
              value={form.useElevenLabs}
              onChange={(value) => setForm({ ...form, useElevenLabs: value })}
            />
            <Toggle label="生成 LibTV" value={form.useLibTV} onChange={(value) => setForm({ ...form, useLibTV: value })} />
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading row">
          <div>
            <h3>{aiOutput ? "DeepSeek 输出" : "本地模拟输出"}</h3>
            <span>
              DeepSeek：{aiStatus.configured ? "已配置" : "未配置"} · {aiStatus.model}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="seal-button" onClick={generateWithAi} disabled={generating || !aiStatus.configured}>
              <Sparkles size={16} />
              {generating ? "生成中..." : "调用 DeepSeek"}
            </button>
            <button className="secondary-button" onClick={copyAll}>
              {copied === "all" ? <Check size={16} /> : <Copy size={16} />}
              一键复制
            </button>
            <button className="secondary-button" onClick={saveToTemplate}>
              <Sparkles size={16} />
              {saved === "template" ? "已保存模板" : "保存为模板"}
            </button>
            <button className="primary-button" onClick={saveToVideo}>
              <Save size={16} />
              {saved === "video" ? "已保存视频" : "保存到视频库"}
            </button>
          </div>
        </div>
        {!aiStatus.configured && (
          <div className="filter-note mb-4">
            DeepSeek API Key 还没配置。请在项目 `.env` 里填写 `DEEPSEEK_API_KEY`，然后重启本地服务。
          </div>
        )}
        {generateError && <div className="error-box mb-4">{generateError}</div>}
        <div className="output-grid">
          {Object.entries({
            Hook: output.hook,
            Voiceover: output.voiceover,
            中文口播: output.chineseVoiceover,
            POV: output.pov,
            "TikTok Title": output.title,
            视频内小标题: output.subtitle,
            "Caption / 简介": output.caption,
            Tags: output.tags,
            下单引导: output.cta,
            "LibTV 分镜": output.libtvStoryboard,
            "ElevenLabs 文本": output.elevenLabsText,
            迭代建议: output.iterationAdvice
          }).map(([label, value]) => (
            <div className="output-block" key={label}>
              <div className="flex items-center justify-between gap-3">
                <strong>{label}</strong>
                <button className="mini-icon" onClick={() => copyText(value)} title="复制">
                  <Copy size={14} />
                </button>
              </div>
              <p>{value || "未启用"}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function GeneratorSelect({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <button className={`toggle ${value ? "toggle-on" : ""}`} onClick={() => onChange(!value)} type="button">
      {label}
    </button>
  );
}
