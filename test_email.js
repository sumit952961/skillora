
const WEB3FORMS_ACCESS_KEY = 'a6ccbe68-6389-4793-96cb-6bf2fc103c49';

async function testWeb3Forms() {
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `📩 New Contact Form Message - Test`,
        from_name: 'Skillzeno Portal',
        'Visitor Name': 'Test User',
        'Visitor Email': 'test@example.com',
        'Message': 'This is a test message to check if Web3Forms is working.',
        botcheck: ''
      })
    });
    const text = await res.text();
    console.log('[Web3Forms Response]', text);
  } catch (err) {
    console.error('[Web3Forms Error]', err);
  }
}

testWeb3Forms();
