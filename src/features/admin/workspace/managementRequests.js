// Build the URL, HTTP method, and data for an admin action.
// liveApi.js sends the request. Only supported backend actions are listed here.
export function managementRequest({ resource, action, id, body }) {
  if (resource === 'categories' && action === 'create') {
    return {
      url: '/lost-found/categories',
      method: 'POST',
      body,
    };
  }

  if (resource === 'locations' && action === 'create') {
    return {
      url: '/lost-found/locations',
      method: 'POST',
      body,
    };
  }

  if (resource === 'lost-found' && action === 'create') {
    return {
      url: '/lost-found/reports',
      method: 'POST',
      body,
    };
  }

  if (resource === 'password' && action === 'update') {
    return {
      url: '/users/update-password',
      method: 'PUT',
      body,
    };
  }

  // Convert the numeric record ID to text for the URL.
  let recordId = '';
  if (id !== undefined && id !== null) {
    recordId = String(id);
  }

  const canDelete = ['posts', 'comments', 'tags'].includes(resource);
  if (action === 'delete' && canDelete && recordId) {
    return {
      url: `/${resource}/${recordId}`,
      method: 'DELETE',
    };
  }

  const canCreateOrUpdate = ['posts', 'comments', 'tags'].includes(resource);
  if (canCreateOrUpdate && action === 'create') {
    return {
      url: `/${resource}`,
      method: 'POST',
      body,
    };
  }

  if (canCreateOrUpdate && action === 'update') {
    if (!recordId) {
      throw new Error('A record ID is required.');
    }

    return {
      url: `/${resource}/${recordId}`,
      method: 'PUT',
      body,
    };
  }

  if (resource === 'matches' && action === 'confirm' && recordId) {
    return {
      url: `/lost-found/matches/${recordId}?status=CONFIRMED`,
      method: 'PATCH',
    };
  }

  if (resource === 'matches' && action === 'reject' && recordId) {
    return {
      url: `/lost-found/matches/${recordId}?status=REJECTED`,
      method: 'PATCH',
    };
  }

  if (resource === 'profile' && action === 'update') {
    return {
      url: '/users/update-user',
      method: 'PUT',
      body,
    };
  }

  if (resource === 'claims' && action === 'approve' && recordId) {
    return {
      url: `/lost-found/claims/${recordId}/approve`,
      method: 'PATCH',
    };
  }

  if (resource === 'claims' && action === 'reject' && recordId) {
    return {
      url: `/lost-found/claims/${recordId}/reject`,
      method: 'PATCH',
    };
  }

  throw new Error('This operation is not supported by the backend.');
}
