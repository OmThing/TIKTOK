import { analyzeVideo } from "../lib/analysis";
import { displayValue, type Lookup } from "../lib/modules";

type AnalyticsProps = {
  videos: any[];
  lookup: Lookup;
};

export function Analytics({ videos, lookup }: AnalyticsProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="stat-card wide">
          <span>高 GMV 视频</span>
          <strong>{videos.filter((video) => Number(video.gmv ?? 0) >= 500).length}</strong>
        </div>
        <div className="stat-card wide">
          <span>高播放低转化</span>
          <strong>{videos.filter((video) => Number(video.views ?? 0) >= 10000 && Number(video.orders ?? 0) < 3).length}</strong>
        </div>
        <div className="stat-card wide">
          <span>待复盘视频</span>
          <strong>{videos.filter((video) => video.status === "待复盘" || video.rating === "可优化").length}</strong>
        </div>
      </div>

      <div className="panel">
        <div className="panel-heading">
          <h3>自动复盘判断</h3>
          <span>按播放、完播、点击、成交和 GMV 给出基础建议</span>
        </div>
        <div className="space-y-3">
          {videos.map((video) => {
            const insight = analyzeVideo(video);
            return (
              <div className="review-item" key={video.id}>
                <div>
                  <div className="font-semibold">{video.name}</div>
                  <div className="mt-1 text-sm text-ink/55">
                    {displayValue({ name: "accountId", label: "账号", type: "select", options: (l) => l.accounts.map((a) => ({ label: a.name, value: a.id })) }, video.accountId, lookup)}
                    {" · 播放 "}
                    {video.views ?? 0}
                    {" · 完播 "}
                    {video.completionRate ?? 0}%{" · 点击 "}
                    {video.clickRate ?? 0}%{" · GMV $"}
                    {Number(video.gmv ?? 0).toFixed(2)}
                  </div>
                </div>
                <div className="max-w-[460px]">
                  <div className={`insight-pill ${insight.tone}`}>{insight.label}</div>
                  <p className="mt-2 text-sm text-ink/68">{insight.advice}</p>
                </div>
              </div>
            );
          })}
          {!videos.length && <div className="empty-state">录入视频数据后，这里会自动生成基础复盘判断。</div>}
        </div>
      </div>
    </div>
  );
}
