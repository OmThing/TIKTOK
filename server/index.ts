import cors from "cors";
import express from "express";
import { PrismaClient } from "@prisma/client";
import { ensureDatabase } from "./db-init";
import { deepSeekConfig, generateWithDeepSeek } from "./deepseek";

ensureDatabase();
const prisma = new PrismaClient();
const app = express();
const port = Number(process.env.PORT ?? 8787);

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const resources = {
  regions: {
    model: prisma.region,
    dateFields: [],
    numberFields: [],
    booleanFields: [],
    searchable: ["name", "code", "language", "style", "learningLibrary", "notes"]
  },
  accounts: {
    model: prisma.account,
    dateFields: [],
    numberFields: ["dailyPostTarget"],
    booleanFields: [],
    searchable: ["name", "phoneNo", "positioning", "mainProduct", "status", "styleNotes"]
  },
  products: {
    model: prisma.product,
    dateFields: [],
    numberFields: [],
    booleanFields: [],
    searchable: ["name", "category", "sellingPoints", "emotionalPoints", "tags"]
  },
  videos: {
    model: prisma.video,
    dateFields: ["publishedAt"],
    numberFields: [
      "views",
      "likes",
      "comments",
      "saves",
      "shares",
      "completionRate",
      "clickRate",
      "productClicks",
      "orders",
      "gmv",
      "newFollowers"
    ],
    booleanFields: ["canReplicateProduct", "canReplicateRegion", "addToTemplate"],
    searchable: ["name", "hook", "voiceover", "title", "caption", "tags", "rating"]
  },
  competitors: {
    model: prisma.competitor,
    dateFields: [],
    numberFields: [],
    booleanFields: [],
    searchable: ["accountName", "videoTitle", "productType", "viralAnalysis", "learnings"]
  },
  templates: {
    model: prisma.viralTemplate,
    dateFields: [],
    numberFields: [],
    booleanFields: [],
    searchable: ["name", "sourceVideo", "hookStructure", "titleStructure", "tagsStructure"]
  },
  libtv: {
    model: prisma.libTVWorkflow,
    dateFields: [],
    numberFields: ["shotCount", "secondsPerShot"],
    booleanFields: [],
    searchable: ["name", "videoStyle", "firstFramePrompt", "masterPrompt", "notes"]
  },
  calendar: {
    model: prisma.calendarItem,
    dateFields: ["date"],
    numberFields: [],
    booleanFields: ["published", "needsReview"],
    searchable: ["topic", "videoStatus", "publishTime", "reviewReminder"]
  }
} as const;

type ResourceName = keyof typeof resources;
type PrismaModel = {
  findMany: (args?: any) => Promise<any[]>;
  create: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
};

function getResource(name: string) {
  return resources[name as ResourceName];
}

function getModel(resourceName: ResourceName) {
  return resources[resourceName].model as PrismaModel;
}

function normalizePayload(resourceName: ResourceName, payload: Record<string, unknown>) {
  const resource = resources[resourceName];
  const data: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (key === "id" || key === "createdAt" || key === "updatedAt") continue;

    if (resource.dateFields.includes(key as never)) {
      data[key] = value ? new Date(String(value)) : null;
      continue;
    }

    if (resource.numberFields.includes(key as never)) {
      const parsed = Number(value);
      data[key] = Number.isFinite(parsed) ? parsed : 0;
      continue;
    }

    if (resource.booleanFields.includes(key as never)) {
      data[key] = value === true || value === "true";
      continue;
    }

    data[key] = value ?? "";
  }

  return data;
}

function buildWhere(resourceName: ResourceName, query: unknown) {
  if (!query || typeof query !== "string") return undefined;
  const trimmed = query.trim();
  if (!trimmed) return undefined;
  const resource = resources[resourceName];
  return {
    OR: resource.searchable.map((field) => ({
      [field]: { contains: trimmed }
    }))
  };
}

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, service: "TK Content Growth OS API" });
});

app.get("/api/ai/status", (_request, response) => {
  const config = deepSeekConfig();
  response.json({
    provider: "deepseek",
    configured: config.configured,
    baseUrl: config.baseUrl,
    model: config.model
  });
});

app.post("/api/generator/deepseek", async (request, response, next) => {
  try {
    const output = await generateWithDeepSeek(request.body);
    response.json(output);
  } catch (error) {
    next(error);
  }
});

app.get("/api/bootstrap", async (_request, response, next) => {
  try {
    const [regions, accounts, products, videos, competitors, templates, libtv, calendar] =
      await Promise.all([
        prisma.region.findMany({ orderBy: { updatedAt: "desc" } }),
        prisma.account.findMany({ orderBy: { updatedAt: "desc" } }),
        prisma.product.findMany({ orderBy: { updatedAt: "desc" } }),
        prisma.video.findMany({ orderBy: { updatedAt: "desc" } }),
        prisma.competitor.findMany({ orderBy: { updatedAt: "desc" } }),
        prisma.viralTemplate.findMany({ orderBy: { updatedAt: "desc" } }),
        prisma.libTVWorkflow.findMany({ orderBy: { updatedAt: "desc" } }),
        prisma.calendarItem.findMany({ orderBy: { date: "asc" } })
      ]);

    response.json({ regions, accounts, products, videos, competitors, templates, libtv, calendar });
  } catch (error) {
    next(error);
  }
});

app.get("/api/:resource", async (request, response, next) => {
  try {
    const resourceName = request.params.resource as ResourceName;
    const resource = getResource(resourceName);
    if (!resource) return response.status(404).json({ error: "未知资源" });

    const rows = await getModel(resourceName).findMany({
      where: buildWhere(resourceName, request.query.q),
      orderBy: { updatedAt: "desc" }
    });
    response.json(rows);
  } catch (error) {
    next(error);
  }
});

app.post("/api/:resource", async (request, response, next) => {
  try {
    const resourceName = request.params.resource as ResourceName;
    const resource = getResource(resourceName);
    if (!resource) return response.status(404).json({ error: "未知资源" });

    const row = await getModel(resourceName).create({
      data: normalizePayload(resourceName, request.body)
    });
    response.status(201).json(row);
  } catch (error) {
    next(error);
  }
});

app.put("/api/:resource/:id", async (request, response, next) => {
  try {
    const resourceName = request.params.resource as ResourceName;
    const resource = getResource(resourceName);
    if (!resource) return response.status(404).json({ error: "未知资源" });

    const row = await getModel(resourceName).update({
      where: { id: request.params.id },
      data: normalizePayload(resourceName, request.body)
    });
    response.json(row);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/:resource/:id", async (request, response, next) => {
  try {
    const resourceName = request.params.resource as ResourceName;
    const resource = getResource(resourceName);
    if (!resource) return response.status(404).json({ error: "未知资源" });

    await getModel(resourceName).delete({ where: { id: request.params.id } });
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error);
  response.status(500).json({
    error: error instanceof Error ? error.message : "服务器错误"
  });
});

app.listen(port, () => {
  console.log(`TK Content Growth OS API running at http://localhost:${port}`);
});
