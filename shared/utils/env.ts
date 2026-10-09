/** Base URL da API — protótipo usa mock local quando não houver `VITE_API_URL`. */
export function getBaseURL(): string {
  const envURL = import.meta.env.VITE_API_URL as string | undefined;
  if (envURL?.trim()) {
    return envURL.endsWith("/") ? envURL : `${envURL}/`;
  }
  return "http://localhost:6969/";
}
