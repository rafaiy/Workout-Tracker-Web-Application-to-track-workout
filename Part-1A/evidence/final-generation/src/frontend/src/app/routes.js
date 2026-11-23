export function routeFor(pathname) {
  const match = pathname.match(/^\/sessions\/(\d+)$/);
  if (match) return { page: 'detail', sessionId: Number(match[1]) };
  if (pathname === '/workout') return { page: 'workout' };
  return { page: 'history' };
}

export function navigate(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
