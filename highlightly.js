// Netlify Function: relais sécurisé vers Highlightly Football API
// La clé reste côté serveur (variable d'environnement), jamais exposée au navigateur.

exports.handler = async function (event) {
  const params = event.queryStringParameters || {};
  const { path, ...rest } = params;

  if (!path) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Paramètre 'path' manquant (ex: teams, players)." })
    };
  }

  if (!process.env.HIGHLIGHTLY_KEY) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Clé Highlightly non configurée côté serveur (variable HIGHLIGHTLY_KEY manquante)." })
    };
  }

  const qs = new URLSearchParams(rest).toString();
  const url = `https://soccer.highlightly.net/${path}${qs ? "?" + qs : ""}`;

  try {
    const res = await fetch(url, {
      headers: {
        "x-api-key": process.env.HIGHLIGHTLY_KEY,
        "x-rapidapi-key": process.env.HIGHLIGHTLY_KEY
      }
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
      body: JSON.stringify({ error: "Échec de la requête vers Highlightly", detail: e.message })
    };
  }
};
