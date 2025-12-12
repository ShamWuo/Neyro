const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

async function callOpenAI(apiKey, text) {
  const messages = [
    { role: "system", content: "You classify inputs into the PARA method. Output strict JSON with keys classification (INBOX|PROJECT|AREA|RESOURCE|ARCHIVE), title, details, and optional type (NOTE|TASK|LINK). Keep it concise." },
    { role: "user", content: `User input: ${text}` },
  ];

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: "gpt-4o-mini", messages, temperature: 0.2, max_tokens: 300 }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${txt}`);
  }
  return res.json();
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY not set in environment");
    process.exit(1);
  }
  const text = process.argv[2] || "Book meeting with design team about feature X and follow up on specs";
  try {
    const json = await callOpenAI(apiKey, text);
    const content = json.choices?.[0]?.message?.content ?? "";
    console.log("--- raw model content ---\n", content);
    // Try to extract first JSON object
    const match = String(content).match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const obj = JSON.parse(match[0]);
        console.log('\n--- parsed JSON ---\n', JSON.stringify(obj, null, 2));
      } catch (err) {
        console.log('\n--- JSON parse failed ---\n', err.message);
      }
    } else {
      console.log('\n--- no JSON found in response ---');
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
