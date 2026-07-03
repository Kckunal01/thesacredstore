const fetch = require('node-fetch');
(async () => {
  try {
    const response = await fetch('http://localhost:5173/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 1000,
        couponCode: 'WELCOME10',
        validateCouponOnly: false,
        trafficSource: 'test',
        formData: { email: 'test@example.com' }
      })
    });
    const text = await response.text();


  } catch (err) {
    console.error('Fetch error:', err);
  }
})();
