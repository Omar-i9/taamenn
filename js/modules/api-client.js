export const AI_ENDPOINT = "https://134b0027-4792-447a-80fc-eda5c408cdaa-00-2xeabiog9a2i4.pike.replit.dev/api/ai";

export const AI_HEALTH_ENDPOINT = AI_ENDPOINT.replace(/\/api\/ai\/?$/, "/api/healthz");

const REQUEST_TIMEOUT_MS = 20000;
const HEALTH_TIMEOUT_MS = 8000;

export function hasAIEndpoint() {
  return typeof AI_ENDPOINT === "string" && AI_ENDPOINT.trim().length > 0;
}

export async function testAIConnection() {
  if (!hasAIEndpoint()) {
    return {
      ok: false,
      mode: "local",
      reason: "AI_ENDPOINT_EMPTY"
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

  try {
    const response = await fetch(AI_HEALTH_ENDPOINT, {
      method: "GET",
      signal: controller.signal
    });
    const data = await safeReadJson(response);

    if (!response.ok) {
      return {
        ok: false,
        mode: "local",
        status: response.status,
        reason: `HTTP_${response.status}`,
        raw: data
      };
    }

    return {
      ok: true,
      mode: "remote",
      status: data?.status || "ok",
      provider: data?.provider || data?.service || "backend",
      raw: data
    };
  } catch (error) {
    return {
      ok: false,
      mode: "local",
      reason: mapNetworkError(error)
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function requestAIAnswer(payload = {}) {
  if (!hasAIEndpoint()) {
    return {
      ok: false,
      mode: "local",
      reason: "AI_ENDPOINT_EMPTY"
    };
  }

  const question = String(payload.question || "").trim();
  if (!question) {
    return {
      ok: false,
      mode: "local",
      reason: "EMPTY_QUESTION"
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalizePayload({ ...payload, question })),
      signal: controller.signal
    });
    const data = await safeReadJson(response);

    if (!response.ok) {
      return {
        ok: false,
        mode: "local",
        status: response.status,
        reason: `HTTP_${response.status}`,
        raw: data
      };
    }

    if (data?.error) {
      return {
        ok: false,
        mode: "local",
        status: response.status,
        reason: "BACKEND_ERROR",
        backendError: String(data.error || ""),
        raw: data
      };
    }

    const answer = extractAnswer(data);
    if (!answer) {
      return {
        ok: false,
        mode: "local",
        status: response.status,
        reason: "EMPTY_ANSWER",
        raw: data
      };
    }

    return {
      ok: true,
      mode: data?.mode || "remote",
      provider: data?.provider || data?.service || "gemini",
      model: data?.model || data?.modelName || "",
      answer,
      sources: Array.isArray(data?.sources) ? data.sources : [],
      raw: data,
      reason: ""
    };
  } catch (error) {
    return {
      ok: false,
      mode: "local",
      reason: mapNetworkError(error)
    };
  } finally {
    clearTimeout(timeout);
  }
}

function normalizePayload(payload) {
  return {
    question: String(payload.question || "").trim(),
    siteKnowledge: payload.siteKnowledge || payload.knowledge || {},
    pageContext: payload.pageContext || "",
    generalKnowledge: payload.generalKnowledge || {},
    questionAnalysis: payload.questionAnalysis || {},
    conversationContext: payload.conversationContext || {},
    assistantInstructions: payload.assistantInstructions || ""
  };
}

async function safeReadJson(response) {
  const text = await response.text().catch(() => "");
  if (!text.trim()) return {};

  try {
    return JSON.parse(text);
  } catch (error) {
    return {
      parseError: "MALFORMED_JSON",
      textPreview: text.slice(0, 180),
      message: error?.message || "Unable to parse response JSON"
    };
  }
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

function mapNetworkError(error) {
  if (error?.name === "AbortError") return "TIMEOUT";
  if (error instanceof TypeError) return "NETWORK_OR_CORS";
  return error?.message || "REQUEST_FAILED";
}
