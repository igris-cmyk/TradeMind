import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const auth = vi.fn();
  const hasPremiumAccess = vi.fn();
  const prisma = {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    trade: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    journalEntry: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    insight: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    coachingSession: {
      create: vi.fn(),
    },
    aIAnalysis: {
      upsert: vi.fn(),
    },
  };

  return {
    auth,
    hasPremiumAccess,
    nextAuth: vi.fn(() => ({
      handlers: { GET: vi.fn(), POST: vi.fn() },
      auth,
      signIn: vi.fn(),
      signOut: vi.fn(),
    })),
    prisma,
  };
});

vi.mock("next-auth", () => ({
  default: mocks.nextAuth,
}));

vi.mock("@auth/prisma-adapter", () => ({
  PrismaAdapter: vi.fn(() => ({})),
}));

vi.mock("next-auth/providers/google", () => ({
  default: vi.fn((config) => ({ id: "google", type: "oauth", ...config })),
}));

vi.mock("next-auth/providers/credentials", () => ({
  default: vi.fn((config) => ({ id: "credentials", type: "credentials", ...config })),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mocks.prisma,
}));

vi.mock("@/lib/env", () => ({
  env: {
    DATABASE_URL: "postgresql://test:test@localhost:5432/trademind_test",
    NEXTAUTH_URL: "http://test.local",
    AUTH_SECRET: "test-secret",
    AUTH_GOOGLE_ID: "",
    AUTH_GOOGLE_SECRET: "",
    OPENAI_API_KEY: "",
    STRIPE_SECRET_KEY: "",
    STRIPE_PRICE_PRO: "",
    STRIPE_PRICE_ELITE: "",
    STRIPE_WEBHOOK_SECRET: "",
    UPLOADTHING_SECRET: "",
    UPLOADTHING_APP_ID: "",
    UPSTASH_REDIS_REST_URL: "",
    UPSTASH_REDIS_REST_TOKEN: "",
  },
}));

vi.mock("@/lib/entitlements", () => ({
  hasPremiumAccess: mocks.hasPremiumAccess,
}));

vi.mock("ai", () => ({
  generateObject: vi.fn(),
  generateText: vi.fn(),
}));

vi.mock("@ai-sdk/openai", () => ({
  openai: vi.fn(),
}));

const userASession = {
  user: {
    id: "user-a",
    email: "a@example.com",
    plan: "FREE",
    role: "USER",
    onboardingComplete: false,
    subscriptionStatus: null,
  },
};

function jsonRequest(url: string, method: string, body: unknown) {
  return new Request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue(userASession);
  mocks.hasPremiumAccess.mockResolvedValue(true);
});

describe("trade ownership", () => {
  it("returns 401 for unauthenticated users", async () => {
    mocks.auth.mockResolvedValueOnce(null);
    const { GET } = await import("@/app/api/trades/[id]/route");

    const response = await GET(new Request("http://test.local/api/trades/trade-b"), {
      params: { id: "trade-b" },
    });

    expect(response.status).toBe(401);
    expect(mocks.prisma.trade.findFirst).not.toHaveBeenCalled();
  });

  it("prevents User A from reading User B's trade", async () => {
    mocks.prisma.trade.findFirst.mockResolvedValueOnce(null);
    const { GET } = await import("@/app/api/trades/[id]/route");

    const response = await GET(new Request("http://test.local/api/trades/trade-b"), {
      params: { id: "trade-b" },
    });

    expect(response.status).toBe(404);
    expect(mocks.prisma.trade.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "trade-b", userId: "user-a" } })
    );
  });

  it("prevents User A from updating User B's trade", async () => {
    mocks.prisma.trade.findFirst.mockResolvedValueOnce(null);
    const { PUT } = await import("@/app/api/trades/[id]/route");

    const response = await PUT(
      jsonRequest("http://test.local/api/trades/trade-b", "PUT", {
        pair: "EURUSD",
        direction: "LONG",
        entry: 1.1,
        stopLoss: 1,
        takeProfit: 1.2,
        status: "OPEN",
      }),
      { params: { id: "trade-b" } }
    );

    expect(response.status).toBe(404);
    expect(mocks.prisma.trade.update).not.toHaveBeenCalled();
    expect(mocks.prisma.trade.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "trade-b", userId: "user-a" } })
    );
  });

  it("prevents User A from deleting User B's trade", async () => {
    mocks.prisma.trade.findFirst.mockResolvedValueOnce(null);
    const { DELETE } = await import("@/app/api/trades/[id]/route");

    const response = await DELETE(new Request("http://test.local/api/trades/trade-b"), {
      params: { id: "trade-b" },
    });

    expect(response.status).toBe(404);
    expect(mocks.prisma.trade.delete).not.toHaveBeenCalled();
    expect(mocks.prisma.trade.findFirst).toHaveBeenCalledWith({
      where: { id: "trade-b", userId: "user-a" },
    });
  });
});

describe("journal trade isolation", () => {
  it("prevents User A from creating a journal entry linked to User B's trade", async () => {
    mocks.prisma.trade.findFirst.mockResolvedValueOnce(null);
    const { POST } = await import("@/app/api/journal/route");

    const response = await POST(
      jsonRequest("http://test.local/api/journal", "POST", {
        content: "Trying to link a foreign trade",
        mood: "focused",
        tradeId: "trade-b",
      })
    );

    expect(response.status).toBe(404);
    expect(mocks.prisma.journalEntry.create).not.toHaveBeenCalled();
    expect(mocks.prisma.trade.findFirst).toHaveBeenCalledWith({
      where: { id: "trade-b", userId: "user-a" },
      select: { id: true },
    });
  });

  it("prevents User A from updating a journal entry to link to User B's trade", async () => {
    mocks.prisma.journalEntry.findFirst.mockResolvedValueOnce({
      id: "entry-a",
      userId: "user-a",
    });
    mocks.prisma.trade.findFirst.mockResolvedValueOnce(null);
    const { PUT } = await import("@/app/api/journal/[id]/route");

    const response = await PUT(
      jsonRequest("http://test.local/api/journal/entry-a", "PUT", {
        content: "Linking a foreign trade",
        mood: "focused",
        tradeId: "trade-b",
      }),
      { params: { id: "entry-a" } }
    );

    expect(response.status).toBe(404);
    expect(mocks.prisma.journalEntry.update).not.toHaveBeenCalled();
    expect(mocks.prisma.trade.findFirst).toHaveBeenCalledWith({
      where: { id: "trade-b", userId: "user-a" },
      select: { id: true },
    });
  });

  it("returns a consistent 404 for authenticated access to a non-owned journal entry", async () => {
    mocks.prisma.journalEntry.findFirst.mockResolvedValueOnce(null);
    const { PUT } = await import("@/app/api/journal/[id]/route");

    const response = await PUT(
      jsonRequest("http://test.local/api/journal/entry-b", "PUT", {
        content: "Trying to update a foreign entry",
      }),
      { params: { id: "entry-b" } }
    );

    expect(response.status).toBe(404);
    expect(mocks.prisma.journalEntry.update).not.toHaveBeenCalled();
    expect(mocks.prisma.journalEntry.findFirst).toHaveBeenCalledWith({
      where: { id: "entry-b", userId: "user-a" },
    });
  });

  it("does not expose another user's linked trade through journal includes", async () => {
    mocks.prisma.journalEntry.findMany.mockResolvedValueOnce([
      {
        id: "entry-a",
        userId: "user-a",
        content: "Old linked entry",
        mood: "calm",
        tradeId: "trade-b",
        createdAt: new Date("2026-05-01T00:00:00.000Z"),
        trade: {
          userId: "user-b",
          pair: "XAUUSD",
          direction: "SHORT",
          status: "WIN",
          pnl: 100,
        },
      },
    ]);
    mocks.prisma.journalEntry.count.mockResolvedValueOnce(1);
    const { GET } = await import("@/app/api/journal/route");

    const response = await GET(new Request("http://test.local/api/journal"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.entries[0].trade).toBeNull();
  });
});

describe("premium entitlement enforcement", () => {
  beforeEach(() => {
    mocks.hasPremiumAccess.mockResolvedValue(false);
  });

  it("blocks free users from /api/coaching", async () => {
    const { POST } = await import("@/app/api/coaching/route");

    const response = await POST();

    expect(response.status).toBe(403);
    expect(mocks.prisma.trade.findMany).not.toHaveBeenCalled();
  });

  it("blocks free users from /api/insights", async () => {
    const { POST } = await import("@/app/api/insights/route");

    const response = await POST();

    expect(response.status).toBe(403);
    expect(mocks.prisma.trade.findMany).not.toHaveBeenCalled();
  });

  it("blocks free users from /api/behavior/patterns", async () => {
    const { GET } = await import("@/app/api/behavior/patterns/route");

    const response = await GET();

    expect(response.status).toBe(403);
    expect(mocks.prisma.trade.findMany).not.toHaveBeenCalled();
  });

  it("blocks free users from /api/trades/[id]/analyze", async () => {
    const { POST } = await import("@/app/api/trades/[id]/analyze/route");

    const response = await POST(new Request("http://test.local/api/trades/trade-a/analyze"), {
      params: { id: "trade-a" },
    });

    expect(response.status).toBe(403);
    expect(mocks.prisma.trade.findFirst).not.toHaveBeenCalled();
  });
});

describe("authoritative session fields", () => {
  const callbackUser = {
    id: "user-a",
    email: "a@example.com",
    emailVerified: null,
  };

  it("does not allow client session.update to forge plan", async () => {
    mocks.prisma.user.findUnique.mockResolvedValueOnce({
      plan: "FREE",
      role: "USER",
      image: null,
      name: "Trader A",
      onboardingProfile: null,
      subscription: null,
    });
    const { authConfig } = await import("@/lib/auth");

    const token = await authConfig.callbacks?.jwt?.({
      token: { id: "user-a", plan: "FREE" },
      user: callbackUser,
      account: null,
      profile: undefined,
      trigger: "update",
      session: { user: { plan: "ELITE" } },
    });

    expect(token?.plan).toBe("FREE");
    expect(mocks.prisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user-a" },
        select: expect.objectContaining({ plan: true, role: true }),
      })
    );
  });

  it("does not allow client session.update to forge onboardingComplete", async () => {
    mocks.prisma.user.findUnique.mockResolvedValueOnce({
      plan: "FREE",
      role: "USER",
      image: null,
      name: "Trader A",
      onboardingProfile: null,
      subscription: null,
    });
    const { authConfig } = await import("@/lib/auth");

    const token = await authConfig.callbacks?.jwt?.({
      token: { id: "user-a", plan: "FREE", onboardingComplete: false },
      user: callbackUser,
      account: null,
      profile: undefined,
      trigger: "update",
      session: { user: { onboardingComplete: true } },
    });

    expect(token?.onboardingComplete).toBe(false);
  });
});
