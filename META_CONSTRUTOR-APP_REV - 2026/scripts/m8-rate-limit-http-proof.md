# M8.1 Rate Limit HTTP Verification Proof

**Date:** 2026-02-10
**Method:** Manual `curl.exe` execution against local `supabase functions serve`.
**Limit:** 2 requests per 60 seconds (IP-based).

## Execution Logs

### Request 2 (Sequence)
Command: `curl.exe -i http://localhost:54321/functions/v1/health-check`
Output:
```http
HTTP/1.1 200 OK
Content-Type: application/json
Access-Control-Allow-Origin: *
...
{"status":"ok",...}
```

### Request 3 (Sequence - Rate Limit Triggered)
Command: `curl.exe -i http://localhost:54321/functions/v1/health-check`
Output:
```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 60
Access-Control-Allow-Origin: *
...
{
  "error": "rate_limited",
  "message": "Too Many Requests",
  "reset_at": "2026-02-10T...",
  "request_id": "...",
  "retry_after_seconds": 60
}
```

## Conclusion
The API correctly returns `429 Too Many Requests` with a JSON body and `Retry-After` header when the limit is exceeded.
