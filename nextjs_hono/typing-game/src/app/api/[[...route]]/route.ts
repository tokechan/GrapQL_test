import { Hono } from "hono";
import { handle } from "hono/vercel";
import { env } from "hono/adapter";
import { Redis } from "@upstash/redis";


type EnvConfig = {
    UPSTASH_REDIS_REST_URL: string;
    UPSTASH_REDIS_REST_TOKEN: string;
};

const app = new Hono().basePath("/api");

app.get("/ping", (c) => {
    return c.text("pong");
});

app.post("/api/result", async (c) =>{
    try {
    const { score, userName } = await c.req.json();

    if (!score || !userName) {
        return c.json({ error: "Missing score or userName" }, 400);
    }

    const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } =
    env<EnvConfig>(c);

    const redis = new Redis({
        url: UPSTASH_REDIS_REST_URL,
        token: UPSTASH_REDIS_REST_TOKEN,
    });

    const result = {
        score: score,
        member: userName,
    };

    await redis.zadd("typing-score-rank", result);

    return c.json({
        message: "Score submitted successfully",
    });
    } catch (e) {
        return c.json({ error: `Error: ${e}` }, 500);
    }
});


export const GET = handle(app);
export const POST = handle(app);