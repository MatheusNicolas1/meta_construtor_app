# M8.1 Rate Limit Manual Verification Steps

Due to local environment restrictions blocking automated process spawning, the following steps must be run manually to verify HTTP 429 responses.

## Prerequisites
- Supabase local instance running (`npx supabase start`)

## Steps

1. **Stop existing Functions Server** (if running)
   ```bash
   # Ctrl+C in the terminal running 'supabase functions serve'
   # OR find PID and kill it
   ```

2. **Start Fresh Functions Server**
   ```bash
   npx supabase functions serve --no-verify-jwt --env-file .env.local
   ```
   *Wait for "Serving functions..."*

3. **Execute Requests (Curl or Browser)**
   Open a new terminal and run:

   **Request 1 (Expected: 200 OK)**
   ```bash
   curl -v http://localhost:54321/functions/v1/health-check
   ```

   **Request 2 (Expected: 200 OK)**
   ```bash
   curl -v http://localhost:54321/functions/v1/health-check
   ```

   **Request 3 (Expected: 429 Too Many Requests)**
   ```bash
   curl -v http://localhost:54321/functions/v1/health-check
   ```

## Expected Output (Request 3)
```json
< HTTP/1.1 429 Too Many Requests
< Retry-After: 60
...
{
  "error": "rate_limited",
  "retry_after_seconds": 60,
  "reset_at": "...",
  "request_id": "...",
  "message": "Too Many Requests"
}
```

## Evidence
Once verified, copy the output of Request 3 and update `docs/PRD.md` item 8.1.
