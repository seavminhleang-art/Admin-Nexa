import { baseApi } from '@/store/api/baseApi';
import { rankContributors } from './leaderboardScores';
import { managementRequest } from './managementRequests';
import { request } from '@/store/api/forumRequest';

export const resourcePaths = {
  categories: '/lost-found/categories',
  locations: '/lost-found/locations',
  leaderboard: '/posts',
  users: '/users/search?query=',
  posts: '/posts',
  comments: '/comments/search?query=',
  tags: '/tags',
  'lost-found': '/lost-found/reports',
};

// Convert the supported API list formats into { rows, total } for the tables.
export function unpackList(data) {
  if (Array.isArray(data)) {
    return { rows: data, total: null };
  }

  const body = data?.data ?? data;
  let rows = body;
  if (!Array.isArray(body)) {
    rows = body?.content ?? body?.items ?? body?.results;
  }
  if (!Array.isArray(rows)) {
    throw new Error('The API returned an unsupported list format.');
  }

  let total = body?.totalElements ?? body?.total ?? data?.totalElements ?? data?.total;
  if (!Number.isFinite(total)) {
    total = null;
  }
  return { rows, total };
}

// Queries load data. Mutations create, update, or delete data.
// Tags tell RTK Query which saved results to reload after a successful change.

const liveApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    adminResource: builder.query({
      async queryFn(argument, api, options) {
        let settings = argument;
        if (typeof argument === 'string') {
          settings = { resource: argument };
        }
        const { resource, search = '' } = settings;
        if (!resourcePaths[resource]) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: 'This resource has no configured endpoint.',
            },
          };
        }
        try {
          let path = resourcePaths[resource];
          const searchPaths = {
            users: '/users/search',
            posts: '/posts/search',
            comments: '/comments/search',
            tags: '/tags/search',
          };
          if (search && searchPaths[resource]) {
            path = `${searchPaths[resource]}?query=${encodeURIComponent(search)}`;
          }
          const response = await request(path, api, options);
          if (response.error) {
            return response;
          }
          const data = unpackList(response.data);
          if (resource === 'leaderboard') {
            const rows = rankContributors(data.rows).map((user) => ({
              ...user,
              displayName: user.name,
            }));
            return { data: { rows, total: rows.length } };
          }
          return { data };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        }
      },
      providesTags: (_result, _error, argument) => {
        let resource = argument;
        if (typeof argument !== 'string') {
          resource = argument.resource;
        }
        const tags = {
          categories: 'Category',
          locations: 'Location',
          leaderboard: 'Post',
          users: 'User',
          posts: 'Post',
          comments: 'Comment',
          tags: 'Tag',
          'lost-found': 'LostFound',
        };
        const resultTags = ['Analytics'];
        if (tags[resource]) {
          resultTags.push(tags[resource]);
        }
        return resultTags;
      },
    }),
    adminManage: builder.mutation({
      async queryFn(argument, api, options) {
        try {
          const requestDetails = managementRequest(argument);
          return await request(requestDetails, api, options);
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        }
      },
      invalidatesTags: (result, error) => {
        if (error) {
          return [];
        }
        return [
          'User', 'Post', 'Comment', 'Tag', 'Claim',
          'Match', 'LostFound', 'Category', 'Location', 'Analytics',
        ];
      },
    }),
    adminReportRelated: builder.query({
      async queryFn({ id, kind }, api, options) {
        if (!['claims', 'matches'].includes(kind) || id == null) {
          return {
            error: { status: 'CUSTOM_ERROR', error: 'Invalid report request.' },
          };
        }
        const response = await request(`/lost-found/reports/${encodeURIComponent(id)}/${kind}`, api, options);
        if (response.error) {
          return response;
        }
        try {
          return { data: unpackList(response.data) };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        }
      },
      providesTags: ['Claim', 'Match', 'LostFound'],
    }),
    adminProfile: builder.query({
      query: () => '/users/me',
      providesTags: ['User'],
    }),

  }),
});
export const {
  useAdminResourceQuery,
  useAdminManageMutation,
  useAdminReportRelatedQuery,
  useAdminProfileQuery,
} = liveApi;
