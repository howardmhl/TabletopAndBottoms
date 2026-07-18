export async function addMatch(match) {
  return postAdminData("/.netlify/functions/admin-match", match);
}

export async function addPrize(prize) {
  return postAdminData("/.netlify/functions/admin-prize", prize);
}

async function postAdminData(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "The admin action failed.");
  }

  return data;
}
