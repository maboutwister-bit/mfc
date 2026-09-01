// Netlify Function: relais sécurisé vers Sportmonks Football API v3
// Le token reste côté serveur (variable d'environnement), jamais exposé au navigateur.

exports.handler = async function (event) {
  const params = event.queryStringParameters || {};
  const { path, ...rest } = params;

  if (!path) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Paramètre 'path' manquant (ex: teams/search/Reims)." })
    };
  }

  if (!process.env.SPORTMONKS_TOKEN) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Token Sportmonks non configuré côté serveur (variable SPORTMONKS_TOKEN manquante)." })
    };
  }

  const qs = new URLSearchParams({ ...rest, api_token: process.env.SPORTMONKS_TOKEN }).toString();
  const url = `https://api.sportmonks.com/v3/football/${path}?${qs}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return {
      statusCode: res.status,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(data)
    };
  } catch (e) {
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Échec de la requête vers Sportmonks", detail: e.message })
    };
  }
};
