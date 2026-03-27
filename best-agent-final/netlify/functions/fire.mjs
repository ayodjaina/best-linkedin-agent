export default async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response("", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: corsHeaders,
    });
  }

  try {
    const { zapUrl, payload } = await req.json();

    if (!zapUrl || !zapUrl.includes("zapier.com")) {
      return new Response(JSON.stringify({ error: "Invalid Zapier URL" }), {
        status: 400, headers: corsHeaders,
      });
    }

    // Server-side call to Zapier - runs on Netlify servers, zero CORS restrictions
    const zapRes = await fetch(zapUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseText = await zapRes.text();

    return new Response(JSON.stringify({
      ok: zapRes.ok,
      status: zapRes.status,
      body: responseText.slice(0, 300),
    }), { status: 200, headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500, headers: corsHeaders,
    });
  }
};

export const config = {
  path: "/api/fire",
};
