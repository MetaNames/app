import { metaNamesSdkFactory } from "$lib/sdk";
import { json } from "@sveltejs/kit";

export const metaNamesSdk = metaNamesSdkFactory({ cache_ttl: 0 });

export const handleError = (fn: () => Promise<Response>) => fn().catch((error) => {
  console.error(error);

  let message = 'Cannot handle your request at the moment. Please try again later.';
  if (error instanceof Error) message = error.message;

  return json({ error: message }, { status: 400 });
})
