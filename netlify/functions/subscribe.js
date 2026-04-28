// netlify/functions/subscribe.js
//
// This function is your secure proxy between the form and Mailchimp's API.
// It keeps your API key off the browser and handles CORS.
//
// SETUP:
//   1. In Netlify dashboard → Site Settings → Environment Variables, add:
//        MAILCHIMP_API_KEY   = your-api-key          (e.g. abc123...–us21)
//        MAILCHIMP_SERVER    = us21                   (the prefix in your Mailchimp URL)
//        MAILCHIMP_AUDIENCE  = your-audience-id       (Audience → Settings → Audience name & defaults)
//
//   2. Deploy this file at: netlify/functions/subscribe.js
//      Netlify auto-detects and serves it at: /.netlify/functions/subscribe

exports.handler = async (event) => {

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { firstName, lastName, email, phone, ref } = body;

  if (!email || !firstName) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  // ── Pull credentials from environment variables (never hardcode these) ──
  const API_KEY  = process.env.MAILCHIMP_API_KEY;
  const SERVER   = process.env.MAILCHIMP_SERVER;    // e.g. "us21"
  const AUDIENCE = process.env.MAILCHIMP_AUDIENCE;  // your list/audience ID

  const url = `https://${SERVER}.api.mailchimp.com/3.0/lists/${AUDIENCE}/members`;

  const payload = {
    email_address: email,
    status: 'subscribed',           // use 'pending' to send a double opt-in confirmation email
    merge_fields: {
      FNAME: firstName,
      LNAME: lastName  || '',
      PHONE: phone     || '',        // optional phone number
      REF:   ref       || ''         // custom merge field — see note below
    }
  };

  try {
    const mcRes = await fetch(url, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Basic ' + Buffer.from('anystring:' + API_KEY).toString('base64')
      },
      body: JSON.stringify(payload)
    });

    const mcData = await mcRes.json();

    // Mailchimp returns 400 if email already exists — handle gracefully
    if (mcData.title === 'Member Exists') {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Already subscribed.' })
      };
    }

    if (!mcRes.ok) {
      console.error('Mailchimp error:', mcData);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: mcData.detail || 'Mailchimp error' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Subscribed successfully.' })
    };

  } catch (err) {
    console.error('Function error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error. Please try again.' })
    };
  }
};