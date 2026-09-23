import { baseApi } from '@/store/api/baseApi';
import { managementRequest } from './managementRequests';
import { request } from '@/store/api/forumRequest';

export const resourcePaths = {
  categories: '/lost-found/categories', locations: '/lost-found/locations', leaderboard: '/users/search?query=',
  users: '/users/search?query=', posts: '/posts', comments: '/comments/search?query=', tags: '/tags',
  'lost-found': '/lost-found/reports', notifications: '/notifications',
};

export function unpackList(data) {
  if (Array.isArray(data)) return { rows: data, total: null };
  const body = data?.data ?? data;
  const rows = Array.isArray(body) ? body : body?.content ?? body?.items ?? body?.results;
  if (!Array.isArray(rows)) throw new Error('The API returned an unsupported list format.');
  const total = body?.totalElements ?? body?.total ?? data?.totalElements ?? data?.total;
  return { rows, total: Number.isFinite(total) ? total : null };
}

const liveApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    adminResource: builder.query({
      async queryFn(argument, api, options) {
        const { resource, search = '', page = 0 } = typeof argument === 'string' ? { resource: argument } : argument;
        if (!resourcePaths[resource]) return { error: { status: 'CUSTOM_ERROR', error: 'This resource has no configured endpoint.' } };
        try {
          let path = resourcePaths[resource];
          const searchPaths = { users: '/users/search', posts: '/posts/search', comments: '/comments/search', tags: '/tags/search' };
          if (search && searchPaths[resource]) path = `${searchPaths[resource]}?query=${encodeURIComponent(search)}`;
          if (resource === 'notifications') path = `/notifications?page=${page}&size=20`;
          const response = await request(path, api, options);
          if (response.error) return response;
          const data = unpackList(response.data);
          return { data };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        }
      },
      providesTags: (_result, _error, argument) => {
        const resource = typeof argument === 'string' ? argument : argument.resource;
        const tags = { categories: 'Category', locations: 'Location', leaderboard: 'User', users: 'User', posts: 'Post', comments: 'Comment', tags: 'Tag', 'lost-found': 'LostFound', notifications: 'Notification' };
        return ['Analytics', ...(tags[resource] ? [tags[resource]] : [])];
      },
    }),
    adminManage: builder.mutation({
      async queryFn(argument, api, options) {
        try { return await request(managementRequest(argument), api, options); }
        catch (error) { return { error: { status: 'CUSTOM_ERROR', error: error.message } }; }
      },
      invalidatesTags: (result, error) => error ? [] : ['User', 'Post', 'Comment', 'Tag', 'Claim', 'Match', 'LostFound', 'Category', 'Analytics'],
    }),
    adminReportRelated: builder.query({
      async queryFn({ id, kind }, api, options) {
        if (!['claims', 'matches'].includes(kind) || id == null) return { error: { status: 'CUSTOM_ERROR', error: 'Invalid report request.' } };
        const response = await request(`/lost-found/reports/${encodeURIComponent(id)}/${kind}`, api, options);
        if (response.error) return response;
        try { return { data: unpackList(response.data) }; }
        catch (error) { return { error: { status: 'CUSTOM_ERROR', error: error.message } }; }
      },
      providesTags: ['Claim', 'LostFound'],
    }),
    adminProfile: builder.query({
      queryFn: (_argument, api, options) => request('/users/me', api, options),
      providesTags: ['User'],
    }),
    adminUnreadCount: builder.query({
      queryFn: (_argument, api, options) => request('/notifications/unread-count', api, options),
      providesTags: ['Notification'],
    }),
    adminMarkRead: builder.mutation({
      queryFn: (id, api, options) => request({ url: `/notifications/${encodeURIComponent(id)}/read`, method: 'PATCH' }, api, options),
      invalidatesTags: ['Notification'],
    }),
    adminMarkAllRead: builder.mutation({
      queryFn: (_argument, api, options) => request({ url: '/notifications/read-all', method: 'PATCH' }, api, options),
      invalidatesTags: ['Notification'],
    }),
  }),
});
export const { useAdminResourceQuery, useAdminManageMutation, useAdminReportRelatedQuery, useAdminProfileQuery, useAdminUnreadCountQuery, useAdminMarkReadMutation, useAdminMarkAllReadMutation } = liveApi;
