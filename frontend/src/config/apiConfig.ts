const normalizeBaseUrl = (value: string) => {
  let trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    trimmed = `https://${trimmed}`;
  }
  if (!trimmed.endsWith("/")) {
    trimmed = `${trimmed}/`;
  }
  if (!trimmed.endsWith("/api/")) {
    trimmed = `${trimmed}api/`;
  }
  return trimmed;
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
  : "http://127.0.0.1:8000/api/";

const getWsUrl = () => {
  const wsEnv = getStringEnv("VITE_WS_URL");
  if (!wsEnv) return "ws://127.0.0.1:8000";
  if (!wsEnv.startsWith("ws://") && !wsEnv.startsWith("wss://")) {
    return `wss://${wsEnv}`;
  }
  return wsEnv;
};

export const API_BASE_URL = normalizeBaseUrl(apiEnvUrl ?? defaultApiBaseUrl);
export const WS_BASE_URL = getWsUrl();
export const API_TIMEOUT_MS = getNumberEnv("VITE_API_TIMEOUT_MS", 15000);
export const API_WITH_CREDENTIALS = getBooleanEnv("VITE_API_WITH_CREDENTIALS", false);
