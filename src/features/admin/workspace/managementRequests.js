// Only operations verified in the backend OpenAPI contract are allowed here.
export function managementRequest({ resource, action, id, body }) {
  if (resource === 'categories' && action === 'create') return { url: '/lost-found/categories', method: 'POST', body };
  const key = encodeURIComponent(id ?? '');
  if (action === 'delete' && ['users', 'posts', 'comments', 'tags'].includes(resource) && key) {
    return { url: `/${resource}/${key}`, method: 'DELETE' };
  }
  if (['posts', 'comments', 'tags'].includes(resource) && ['create', 'update'].includes(action)) {
    if (action === 'update' && !key) throw new Error('A record ID is required.');
    return { url: `/${resource}${action === 'update' ? `/${key}` : ''}`, method: action === 'create' ? 'POST' : 'PUT', body };
  }
  if (resource === 'matches' && ['confirm', 'reject'].includes(action) && key) return { url: `/lost-found/matches/${key}?status=${action === 'confirm' ? 'CONFIRMED' : 'REJECTED'}`, method: 'PATCH' };
  if (resource === 'profile' && action === 'update') return { url: '/users/update-user', method: 'PUT', body };
  if (resource === 'claims' && ['approve', 'reject'].includes(action) && key) return { url: `/lost-found/claims/${key}/${action}`, method: 'PATCH' };
  throw new Error('This operation is not supported by the backend.');
}
