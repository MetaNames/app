import type { Handle } from '@sveltejs/kit';
import { config } from './lib';

export const handle: Handle = async ({ resolve, event }) => {
  if (event.url.pathname.startsWith('/api')) {
    if (event.request.method === 'OPTIONS') {
      const domain = new URL(config.landingUrl)

      return new Response(null, {
        headers: {
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Origin': `*.${domain.host}`,
          'Access-Control-Allow-Headers': '*',
        },
      });
    }
    const response = await resolve(event);
    if (event.url.pathname.startsWith('/api')) {
      response.headers.append('Access-Control-Allow-Origin', '*');
      return response;
    }
  }
  return resolve(event);
};
