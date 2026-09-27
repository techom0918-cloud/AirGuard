# AirGuard — TEAM_HANDOFF.md
**Phase 1: Architecture & Contract Lock — FINAL**

## Dependency Map

```
Om ──────────► Siddharth   (ESP32 request format)
Om ──────────► Swapnil     (integration point for edge output)
Swapnil ─────► Om          (risk_level + reason output shape)
Siddharth ───► Rishabh     (API ↔ database field alignment)
Siddharth ───► Maitri      (final API response format)
Rishabh ─────► Maitri      (history/heatmap data shape)
```

## Handoff Details

| From → To | What's handed off | Locked reference |
|---|---|---|
| Om → Siddharth | ESP32 HTTP request format (fields, headers, auth) | API_CONTRACT.md §1–2 |
| Swapnil → Om | `{ risk_level, reason }` from edge detection, feeding into the POST body | API_CONTRACT.md §3 |
| Siddharth → Rishabh | API field names must equal Firestore field names — no renaming at any layer | API_CONTRACT.md §5 |
| Rishabh → Maitri | Shape of `/api/history/:deviceId` response (readings array incl. lat/lng) for dashboard + heatmap | API_CONTRACT.md §4–5 |
| Siddharth → Maitri | Final JSON response format for every endpoint the frontend consumes | API_CONTRACT.md §4 |

## Rule for all members
No one renames a locked field (`device_id`, `pm25`, `temp`, `humidity`, `risk_level`, `reason`, `timestamp`, `lat`, `lng`) without updating this document and notifying the two adjacent owners in the chain above.
