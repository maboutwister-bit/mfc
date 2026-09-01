// Netlify Function: relais sécurisé vers API-Football
// La clé reste côté serveur (variable d'environnement), jamais exposée au navigateur.

exports.handler = async function (event) {
  const params = event.queryStringParameters || {};
  const { endpoint, ...rest } = params;

  if (!endpoint) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Paramètre 'endpoint' manquant (ex: teams, fixtures, transfers)." })
    };
  }

  if (!process.env.API_FOOTBALL_KEY) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Clé API-Football non configurée côté serveur (variable API_FOOTBALL_KEY manquante)." })
    };
  }

  const qs = new URLSearchParams(rest).toString();
  const url = `https://v3.football.api-sports.io/${endpoint}${qs ? "?" + qs : ""}`;

  try {
    const res = await fetch(url, {
      headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY }
    });
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
      body: JSON.stringify({ error: "Échec de la requête vers API-Football", detail: e.message })
    };
  }
};
