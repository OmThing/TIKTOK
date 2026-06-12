export type VideoLike = {
  views?: number;
  completionRate?: number;
  clickRate?: number;
  orders?: number;
  gmv?: number;
};

export function analyzeVideo(video: VideoLike) {
  const views = Number(video.views ?? 0);
  const completionRate = Number(video.completionRate ?? 0);
  const clickRate = Number(video.clickRate ?? 0);
  const orders = Number(video.orders ?? 0);
  const gmv = Number(video.gmv ?? 0);

  if (gmv >= 500 || orders >= 20) {
    return {
      label: "高 GMV 视频",
      advice: "建议保存为爆款模板，并测试换产品、换地区复刻。",
      tone: "strong"
    };
  }

  if (views >= 10000 && orders < 3) {
    return {
      label: "高播放低转化",
      advice: "开头钩子较强，但产品承接或下单引导偏弱。",
      tone: "warn"
    };
  }

  if (views < 3000 && orders >= 3) {
    return {
      label: "低播放高转化",
      advice: "人群精准，可以继续围绕该产品和 Tags 放大。",
      tone: "good"
    };
  }

  if (completionRate >= 45 && clickRate < 1.5) {
    return {
      label: "高完播低点击",
      advice: "内容有趣，但视频内小标题、简介或下单引导不够强。",
      tone: "warn"
    };
  }

  if (clickRate >= 3 && orders < 3) {
    return {
      label: "高点击低成交",
      advice: "种草有效，但价格、产品页、信任感或优惠承接可能有问题。",
      tone: "warn"
    };
  }

  if (completionRate < 20 && clickRate < 1) {
    return {
      label: "低完播低点击",
      advice: "开头钩子、节奏、画面或选题需要重做。",
      tone: "danger"
    };
  }

  return {
    label: "数据观察中",
    advice: "继续积累 24h/48h/72h 数据，再判断下一版迭代方向。",
    tone: "neutral"
  };
}
