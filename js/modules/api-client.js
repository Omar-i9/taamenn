export const AI_ENDPOINT = "https://134b0027-4792-447a-80fc-eda5c408cdaa-00-2xeabiog9a2i4.pike.replit.dev/api/ai";

export const AI_HEALTH_ENDPOINT = AI_ENDPOINT.replace(/\/api\/ai\/?$/, "/api/healthz");

export function hasAIEndpoint() {
  return typeof AI_ENDPOINT === "string" && AI_ENDPOINT.trim().length > 0;
}

function extractAnswer(data) {
  if (!data || typeof data !== "object") return "";

  const candidates = [
    data.answer,
    data?.data?.answer,
    data.message,
    data.result,
    data.output_text,
    data?.response?.answer,
    data?.choices?.[0]?.message?.content
  ];

  const direct = candidates.find(value => typeof value === "string" && value.trim());
  if (direct) return direct.trim();

  if (Array.isArray(data.output)) {
    const text = data.output
      .flatMap(item => Array.isArray(item?.content) ? item.content : [])
      .map(part => part?.text || part?.content || "")
      .filter(Boolean)
      .join("\n")
      .trim();

    if (text) return text;
  }

  return "";
}

export async function testAIConnection() {
  if (!hasAIEndpoint()) {
    return {
      ok: false,
      mode: "local",
      reason: "AI_ENDPOINT is empty"
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(AI_HEALTH_ENDPOINT, {
      method: "GET",
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Health check failed with ${response.status}`);
    }

    const data = await response.json().catch(() => ({}));

    return {
      ok: true,
      mode: "remote",
      status: data?.status || "ok",
      raw: data
    };
  } catch (error) {
    return {
      ok: false,
      mode: "local",
      reason: error?.name === "AbortError"
        ? "AI health check timeout"
        : error?.message || "AI health check failed"
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function requestAIAnswer({ question, knowledge, siteKnowledge, pageContext = "" }) {
  if (!hasAIEndpoint()) {
    return {
      ok: false,
      mode: "local",
      reason: "AI_ENDPOINT is empty"
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const payload = {
      question: String(question || "").trim(),
      siteKnowledge: siteKnowledge || knowledge || {},
      pageContext: String(pageContext || "")
    };

    if (!payload.question) {
      return {
        ok: false,
        mode: "local",
        reason: "Empty question"
      };
    }

    const response = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`AI endpoint failed with ${response.status}`);
    }

    const data = await response.json();
    const answer = extractAnswer(data);

    return {
      ok: Boolean(answer),
      mode: "remote",
      answer,
      raw: data,
      reason: answer ? "" : "AI_EMPTY_RESPONSE"
    };
  } catch (error) {
    return {
      ok: false,
      mode: "local",
      reason: error?.name === "AbortError"
        ? "AI endpoint timeout"
        : error?.message || "AI endpoint failed"
    };
  } finally {
    clearTimeout(timeout);
  }
}
