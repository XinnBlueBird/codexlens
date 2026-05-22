export const runtime = "edge";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are CodexLens, an expert code analysis engine. When given code, provide a structured analysis covering:

1. **Language & Complexity** — Identify the language, estimate cyclomatic complexity (Low/Medium/High), and rate maintainability.

2. **Security Audit** — Flag any security vulnerabilities (injection, XSS, hardcoded secrets, unsafe deserialization, etc.) with severity (Critical/High/Medium/Low).

3. **Performance** — Identify performance bottlenecks, unnecessary allocations, O(n) issues, blocking calls, etc.

4. **Best Practices** — Check adherence to language idioms, naming conventions, error handling patterns, and type safety.

5. **Refactoring Suggestions** — Provide 2-3 concrete refactoring opportunities with before/after code snippets.

6. **Overall Score** — Rate the code 1-100 with a one-line summary.

Be direct, specific, and reference exact line numbers or code snippets. Use markdown formatting. Keep it concise but thorough.`;

export async function POST(req: Request) {
  const { code } = await req.json();

  if (!code || typeof code !== "string") {
    return new Response(JSON.stringify({ error: "Code is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.MIMO_API_KEY;
  const apiBase = process.env.MIMO_API_BASE || "https://token-plan-sgp.xiaomimimo.com/v1";
  const model = process.env.MIMO_MODEL || "mimo-v2.5-pro";

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "MIMO_API_KEY not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const res = await fetch(`${apiBase}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Analyze this code:\n\n\`\`\`\n${code}\n\`\`\`` },
      ],
      stream: true,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return new Response(JSON.stringify({ error: `MiMo API error: ${res.status} - ${errText}` }), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = res.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;
            const data = trimmed.slice(6);
            if (data === "[DONE]") continue;
            try {
              const json = JSON.parse(data);
              const content =
                json.choices?.[0]?.delta?.content ??
                json.choices?.[0]?.delta?.reasoning_content ??
                "";
              if (content) {
                controller.enqueue(encoder.encode(content));
              }
            } catch {}
          }
        }
        // Process remaining buffer
        if (buffer.trim().startsWith("data: ")) {
          const data = buffer.trim().slice(6);
          if (data !== "[DONE]") {
            try {
              const json = JSON.parse(data);
              const content =
                json.choices?.[0]?.delta?.content ??
                json.choices?.[0]?.delta?.reasoning_content ??
                "";
              if (content) controller.enqueue(encoder.encode(content));
            } catch {}
          }
        }
      } catch (e) {
        controller.error(e);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "Transfer-Encoding": "chunked",
    },
  });
}
