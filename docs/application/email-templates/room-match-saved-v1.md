# Saved Room Match Email — Placeholder

## Purpose

When a guest chooses **Save & Email** on the matched-results screen, the booking engine now records the email address and the selected match context through the same tracking pipeline already intended for cart recovery:

```text
browser
  ↓
/api/mews/track
  ↓
WEBHOOK_EVENTS
  ↓
n8n
  ↓
Supabase / recovery data
```

The event name is:

```text
cart.matches_saved
```

The dedicated outbound email template is **not built yet**.

This document is the reminder and implementation placeholder so the delivery layer can be added later without changing the matcher UI or data contract.

## Current Payload

The event includes the normal cart/session data plus:

```json
{
  "matchSave": {
    "emailTemplateKey": "room-match-saved-v1",
    "deliveryStatus": "pending_template",
    "topRoomCategoryId": "<mews room category id>",
    "alternateRoomCategoryIds": [
      "<alternate 1>",
      "<alternate 2>"
    ],
    "party": "partner",
    "dog": false,
    "interests": [
      "indoor-sanctuaries",
      "connection-with-nature"
    ],
    "shareUrl": "<shareable booking-engine URL>"
  }
}
```

The email entered by the guest is also written into the event's normal `customer.email` field so it lives with the same cart/session record used for recovery.

## Future Email Template

Template key:

```text
room-match-saved-v1
```

Suggested content:

- Urban Cowboy branding/header
- selected stay dates
- guest's top match
- "Why this matched" summary
- two alternate matches
- direct link back to the shared matcher/results URL
- Browse All Rooms CTA
- standard transactional footer/privacy language

## Implementation TODO

1. Build the actual HTML/email design.
2. Decide the sending provider used by n8n.
3. Add an n8n branch for `cart.matches_saved`.
4. Resolve Mews RoomCategoryIds in `matchSave` to the saved presentation data needed by the email.
5. Send only after a valid email address is present.
6. Mark delivery status in the downstream record as queued/sent/failed.
7. Remove the temporary consumer-facing note in the Save & Email dialog once delivery is live.
8. Add a delivery test covering top match, two alternates, and the deep/share link.

## Important

The current matcher **saves the match event and email data**, but does not claim that the dedicated match-results email has been delivered yet. The UI explicitly notes that template delivery is still pending.

That behavior is intentional until the email workflow exists.
