import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

addEventListener('fetch', event => {
  event.respondWith(handleEvent(event));
})

async function handleEvent(event) {
  const url = new URL(event.request.url);
  try {
    // Serve static files
    if (event.request.method === "GET" && url.pathname === "/") {
      return await getAssetFromKV(event, {
        path: "/index.html" 
      });
    }

    // Handle API requests
    if (event.request.method === "POST" && url.pathname.startsWith("/api/chat")) {
      return handleApiRequest(event.request);
    }

    // Return method not allowed for other methods
    return new Response('Method not allowed', { status: 405 });
  } catch (e) {
    return new Response('Not found', { status: 404 });
  }
}

async function handleApiRequest(request) {
  const data = await request.json();
  const response = await queryLlamaModel(data.message);
  return new Response(JSON.stringify({ reply: response }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

async function queryLlamaModel(query) {
  const apiUrl = "https://api.cloudflare.com/client/v4/accounts/efeade64cb74f811a452ab55d32844e2/ai/run/@cf/meta/llama-2-7b-chat-int8";
  const apiKey = await getApiKey(); // Ensure this function securely fetches your API key

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: query }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.answer;
}

async function getApiKey() {
  // Retrieve and return the API key securely
  return 'nimbuskey';
}

