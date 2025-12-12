async function run() {
  // Import the dev route module dynamically
  const mod = await import("../src/app/api/dev/assist-test/route");

  // Build a FormData body
  const fd = new FormData();
  fd.append("text", "Automated in-process test of dev assist-test route");

  // Create a Request object (node global fetch/FormData available in modern Node)
  const req = new Request("http://localhost/api/dev/assist-test", { method: "POST", body: fd });

  const res = await mod.POST(req);
  // NextResponse has json() method; try to read body
  try {
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
  } catch (e) {
    console.error("Failed to read JSON from response", e);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
