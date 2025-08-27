// Stores and retrieves the logged-in domain + password from localStorage

export function setLoggedInUser(domain: string, password: string) {
  localStorage.setItem('domain', domain);
  localStorage.setItem('pw', password);
}

export function getLoggedInUser(): { domain: string; pw: string } | null {
  const domain = localStorage.getItem('domain');
  const pw = localStorage.getItem('pw');
  if (!domain || !pw) return null;
  return { domain, pw };
}

export function logout() {
  localStorage.removeItem('domain');
  localStorage.removeItem('pw');
}
