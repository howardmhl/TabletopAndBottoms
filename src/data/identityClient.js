const IDENTITY_API_URL = "https://tabletopandbottoms.howardmhl.co.uk/.netlify/identity";
const USER_STORAGE_KEY = "ttnb.identity.user";
const JWT_COOKIE = "nf_jwt";
const REFRESH_COOKIE = "nf_refresh";

export async function loginWithIdentity(email, password) {
  const tokenResponse = await fetch(`${IDENTITY_API_URL}/token`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "password",
      username: email,
      password
    }).toString()
  });

  const tokenData = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok) {
    throw new Error(tokenData.msg || tokenData.error_description || "Could not log in.");
  }

  const userResponse = await fetch(`${IDENTITY_API_URL}/user`, {
    headers: {
      authorization: `Bearer ${tokenData.access_token}`
    }
  });

  const userData = await userResponse.json().catch(() => ({}));
  if (!userResponse.ok) {
    throw new Error(userData.msg || "Could not load the logged-in user.");
  }

  setAuthCookie(JWT_COOKIE, tokenData.access_token);
  if (tokenData.refresh_token) setAuthCookie(REFRESH_COOKIE, tokenData.refresh_token);

  const user = normalizeUser(userData);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent("ttnb-auth-change", { detail: user }));
  return user;
}

export async function logoutFromIdentity() {
  clearAuthCookie(JWT_COOKIE);
  clearAuthCookie(REFRESH_COOKIE);
  localStorage.removeItem(USER_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("ttnb-auth-change", { detail: null }));
}

export function getStoredUser() {
  try {
    const user = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || "null");
    return user?.email ? user : null;
  } catch {
    return null;
  }
}

function normalizeUser(userData) {
  return {
    id: userData.id ?? "",
    email: userData.email ?? "",
    name: userData.user_metadata?.full_name || userData.user_metadata?.name || userData.email || ""
  };
}

function setAuthCookie(name, value) {
  const secure = window.location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; samesite=lax${secure}`;
}

function clearAuthCookie(name) {
  const secure = window.location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${name}=; path=/; samesite=lax${secure}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
