async function runTests() {
  console.log('====================================================');
  console.log('TESTING CONTEXT AWARENESS & OUT-OF-CONTEXT HANDLING');
  console.log('====================================================');

  const testCases = [
    {
      label: 'TEST 1: Generic shopping without context (for myself)',
      query: 'I need something for myself.',
      expectNoRecs: true
    },
    {
      label: 'TEST 2: Generic shopping without context (I want a crystal)',
      query: 'I want a crystal.',
      expectNoRecs: true
    },
    {
      label: 'TEST 3: Generic gift without context',
      query: 'I need a gift.',
      expectNoRecs: true
    },
    {
      label: 'TEST 4: Out-of-context general knowledge (Capital of France)',
      query: 'What is the capital of France?',
      expectNoRecs: true
    },
    {
      label: 'TEST 5: Out-of-context general chit-chat (Tell me a joke)',
      query: 'Tell me a joke',
      expectNoRecs: true
    },
    {
      label: 'TEST 6: Out-of-context math (What is 25 * 4?)',
      query: 'What is 25 * 4?',
      expectNoRecs: true
    },
    {
      label: 'TEST 7: Out-of-context lifestyle question (What is meditation?)',
      query: 'What is meditation?',
      expectNoRecs: true
    },
    {
      label: 'TEST 8: In-context with specific intent + form factor + budget',
      query: 'A bracelet for stress under ₹800.',
      expectNoRecs: false
    }
  ];

  for (const tc of testCases) {
    console.log(`\n--- ${tc.label} ---`);
    console.log(`User query: "${tc.query}"`);
    const res = await fetch('http://localhost:5173/api/ai-recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: tc.query })
    });
    const data = await res.json();
    console.log(`AI Response:\n${data.message}`);
    console.log(`Recommendations count: ${data.recommendations?.length || 0}`);
    if (tc.expectNoRecs && (data.recommendations?.length || 0) === 0) {
      console.log('Result: [PASS] Zero random recommendations returned!');
    } else if (!tc.expectNoRecs && (data.recommendations?.length || 0) > 0) {
      console.log('Result: [PASS] Contextual recommendations returned appropriately!');
      data.recommendations.forEach(r => console.log(`  -> Product ID: ${r.productId} | Reason: ${r.reason.slice(0, 60)}...`));
    } else {
      console.log(`Result: [FAIL] Expected expectNoRecs=${tc.expectNoRecs}, got count=${data.recommendations?.length}`);
    }
  }

  console.log('\n====================================================');
  console.log('ALL TESTS COMPLETED');
  console.log('====================================================');
}

runTests().catch(console.error);
