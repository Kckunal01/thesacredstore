// Quick test: follow-up questions after recommendations should NOT re-send product cards

const BASE = 'http://localhost:3000/api/ai-recommend';

async function ask(message, history = []) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });
  return res.json();
}

async function run() {
  console.log('═══ FOLLOW-UP QUESTION TESTS ═══\n');

  // Simulate a conversation: user asks for calm crystals, gets recs, then asks follow-ups
  const history = [
    { role: 'user', content: 'I want something for stress and calm, a bracelet under 1500' },
    { role: 'assistant', content: 'Here are some calming bracelets...' },
  ];

  const tests = [
    { msg: 'Is this genuine?', expectNoRecs: true, label: 'Authenticity question' },
    { msg: 'Are these real crystals?', expectNoRecs: true, label: 'Real crystals question' },
    { msg: 'How do I use it?', expectNoRecs: true, label: 'Usage question' },
    { msg: 'Does it actually work?', expectNoRecs: true, label: 'Effectiveness question' },
    { msg: 'Which one is better?', expectNoRecs: true, label: 'Comparison question' },
    { msg: 'Can I wear it in the shower?', expectNoRecs: true, label: 'Water care question' },
    { msg: 'Is it safe for kids?', expectNoRecs: true, label: 'Safety question' },
    { msg: 'Can I combine two crystals?', expectNoRecs: true, label: 'Combining question' },
    { msg: 'Thanks!', expectNoRecs: true, label: 'Acknowledgment' },
    { msg: 'yes', expectNoRecs: true, label: 'Yes/no response' },
    { msg: 'Tell me a joke', expectNoRecs: true, label: 'Out-of-context (joke)' },
    { msg: 'What is 5 + 3?', expectNoRecs: true, label: 'Out-of-context (math)' },
  ];

  let pass = 0;
  let fail = 0;

  for (const t of tests) {
    const data = await ask(t.msg, history);
    const hasRecs = data.recommendations && data.recommendations.length > 0;
    const ok = t.expectNoRecs ? !hasRecs : hasRecs;
    const status = ok ? '✅' : '❌';
    if (ok) pass++; else fail++;
    console.log(`${status} ${t.label}: "${t.msg}"`);
    if (!ok) {
      console.log(`   EXPECTED no recs=${t.expectNoRecs}, GOT ${data.recommendations?.length || 0} recs`);
    }
    console.log(`   → ${data.message?.slice(0, 120)}...\n`);
  }

  console.log(`\n═══ RESULT: ${pass}/${tests.length} passed, ${fail} failed ═══`);
}

run().catch(console.error);
