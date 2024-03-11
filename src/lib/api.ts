import type { ApiError } from "./types";

export async function fetchApiJson<T>(url: string, options: RequestInit = {}): Promise<T | ApiError> {
  let response

  try {
    response = await fetch(url, options);
    const json = await response.json();
    if (!response.ok) {
      let message = 'Something went wrong'
      if (json && json.error) message = json.error;

      return { error: message }
    }

    return json
  } catch (error) {
    console.error(error)
    return { error: 'Something went wrong' }
  }
}
