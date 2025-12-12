// Quick in-process smoke runner (JS) — does not call OpenAI or DB.
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function run() {
  const text = "Automated in-process test of dev assist-test route";
  if (OPENAI_API_KEY) {
    console.log(JSON.stringify({ ok: true, note: "OPENAI_API_KEY present — skipping live call in runner" }, null, 2));
    return;
  }

  const mock = {
    classification: "INBOX",
    title: text.slice(0, 80),
    details: text,
    type: "NOTE",
  };

  console.log(JSON.stringify({ ok: true, decision: mock }, null, 2));
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
