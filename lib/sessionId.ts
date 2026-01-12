// Generate a unique session ID for tracking (stored in localStorage)
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  
  const SESSION_KEY = "wcs_session_id";
  let sessionId = localStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    // Generate a simple unique ID
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
}
