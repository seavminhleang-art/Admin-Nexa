import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Post',
    'Answer',
    'Comment',
    'Vote',
    'Tag',
    'LostFound',
    'Category',
    'Location',
    'Claim',
    'Match',
    'Bookmark',
    'Notification',
    'User',
    'Report',
    'Analytics',
  ],
  endpoints: () => ({}),
});

export default baseApi;
