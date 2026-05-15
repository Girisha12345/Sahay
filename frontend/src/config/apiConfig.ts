const normalizeBaseUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
};

const getStringEnv = (key: string): string | undefined => {
  const value = (import.meta.env[key] as string | undefined)?.trim();
  return value && value.length > 0 ? value : undefined;
};

const getBooleanEnv = (key: string, fallback: boolean): boolean => {
  const value = getStringEnv(key);
  if (!value) return fallback;
  return value.toLowerCase() === "true";
};

const getNumberEnv = (key: string, fallback: number): number => {
  const value = getStringEnv(key);
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const apiEnvUrl = getStringEnv("VITE_API_BASE_URL") ?? getStringEnv("VITE_API_URL");

const defaultApiBaseUrl = import.meta.env.DEV
  ? "/api/"
  : "http://127.0.0.1:8001/api/";

export const API_BASE_URL = normalizeBaseUrl(apiEnvUrl ?? defaultApiBaseUrl);
export const WS_BASE_URL = getStringEnv("VITE_WS_URL") ?? "ws://127.0.0.1:8001";
export const API_TIMEOUT_MS = getNumberEnv("VITE_API_TIMEOUT_MS", 15000);
export const API_WITH_CREDENTIALS = getBooleanEnv("VITE_API_WITH_CREDENTIALS", false);
