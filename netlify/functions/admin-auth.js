import { getUser } from "@netlify/identity";

export async function requireUser() {
  const user = await getUser();
  if (!user) {
    return {
      user: null,
      response: Response.json({ error: "You need to be logged in to do that." }, { status: 401 })
    };
  }

  return { user, response: null };
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function badRequest(message) {
  return Response.json({ error: message }, { status: 400 });
}
