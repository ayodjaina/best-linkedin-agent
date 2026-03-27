exports.handler = async function(event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { zapUrl, payload } = JSON.parse(event.body);

    if (!zapUrl || !zapUrl.includes("zapier.com")) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid or missing Zapier URL" })
      };
    }

    // Server-side fetch to Zapier - no CORS restrictions, no browser, no sandbox
    const response = await fetch(zapUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const text = await response.text();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: response.ok,
        status: response.status,
        zapierResponse: text.slice(0, 200)
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
