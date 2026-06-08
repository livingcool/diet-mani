# ROOTEDAI FIRESTORE SECURITY SPECIFICATION (ABAC)

This document maps out our strict security invariants, adversarial attack vectors (the "Dirty Dozen"), and test configurations to achieve bulletproof access control.

## 1. Core Data Invariants

1. **User Ownership Boundaries**: No user can read or write any other user's profile, daily log, or hair photo records under any circumstance.
2. **Strict Identity Integrity**: In user profile documents, `uid` must strictly match the authenticated user's `uid` from Firebase Auth.
3. **Verified Email Required**: Only authenticated users with verified email tokens (`request.auth.token.email_verified == true`) are permitted to write.
4. **Immunized Fields**: `createdAt` or similar historical fields must be immutable during updates.
5. **No Blind Updates**: Field mutations are limited to exact key schemas (using `affectedKeys().hasOnly()`).

---

## 2. The "Dirty Dozen" Payloads (Adversarial Attacks)

Below are twelve malicious payloads designed to exploit potential "Update-Gaps", "Identity Spoofing", or "Privilege Escalation" in unhardened rules.

### User profiles (`/users/{userId}`)
1. **Attack Type**: Identity Spoofing (Creating user profile with another user's uid)
   * **Path**: `/users/legit_user_123`
   * **Payload**: `{ "uid": "attacker_456", "xp": 1000, "challenges": [], "badges": [] }`
2. **Attack Type**: Spoofed Unverified Email (Attempting write with `email_verified: false`)
   * **Path**: `/users/attacker_456`
   * **Auth Context**: `{ uid: "attacker_456", token: { email_verified: false } }`
3. **Attack Type**: Ghost Field Injection (Updating whitelist with phantom admin configurations)
   * **Path**: `/users/current_user_id`
   * **Payload**: `{ "xp": 1050, "challenges": [], "badges": [], "isSystemAdmin": true }` (Injecting unauthorized privilege keys)
4. **Attack Type**: Large String Payload (Wallet Drainage Attack)
   * **Path**: `/users/current_user_id`
   * **Payload**: `{ "uid": "current_user_id", "xp": 1000, "largeField": "[10MB string...]" }`

### Daily Log (`/users/{userId}/dailyLogs/{date}`)
5. **Attack Type**: Orphaned Write (Writing daily logs under another user's subcollection tree)
   * **Path**: `/users/victim_uid/dailyLogs/2026-06-08`
   * **Auth Context**: `{ uid: "attacker_456" }`
6. **Attack Type**: Invalid Format Date Path Injection (Bypassing chronological query constraints)
   * **Path**: `/users/current_user_id/dailyLogs/invalid-date-format-9999`
   * **Payload**: `{ "date": "invalid-date", "waterIntake": 3000 }`
7. **Attack Type**: Negative Hydration Value Poisoning
   * **Path**: `/users/current_user_id/dailyLogs/2026-06-08`
   * **Payload**: `{ "date": "2026-06-08", "waterIntake": -5000, "sleepDuration": 8.0, "meals": {} }`
8. **Attack Type**: Extreme Sleep Value Hack (Attempting to log unrealistic sleep)
   * **Path**: `/users/current_user_id/dailyLogs/2026-06-08`
   * **Payload**: `{ "date": "2026-06-08", "waterIntake": 1000, "sleepDuration": 999.0, "meals": {} }`

### Hair Photo Timeline (`/users/{userId}/hairPhotos/{photoId}`)
9. **Attack Type**: Corrupt Metric Injection (Setting an out-of-bounds hair fall severity score)
   * **Path**: `/users/current_user_id/hairPhotos/hair_123`
   * **Payload**: `{ "id": "hair_123", "date": "2026-06-08", "photoUrl": "data:image/png;base64,...", "metrics": { "hairFall": 99, "density": 5, "dandruffStatus": "Severe", "growthRate": 5, "scalpItching": "High" } }`
10. **Attack Type**: Rogue Photo Reference Hijacking (Cross-reading other user's uploaded hair progress photos)
    * **Path**: `/users/victim_uid/hairPhotos/hair_123`
    * **Auth Context**: `{ uid: "attacker_uid" }` (Attempting GET)
11. **Attack Type**: Ghost Field Injection (Injecting custom unapproved properties into hair photo entity)
    * **Path**: `/users/current_user_id/hairPhotos/hair_123`
    * **Payload**: `{ "id": "hair_123", "date": "2026-06-08", "photoUrl": "...", "metrics": {}, "approvedByDoctor": true }`
12. **Attack Type**: Overwriting Hair Photo Date
    * **Path**: `/users/current_user_id/hairPhotos/hair_123`
    * **Payload**: `{ "id": "hair_123", "date": "2000-01-01", "photoUrl": "...", "metrics": {} }` (Bypassing chronological continuity)

---

## 3. The Test Runner Configuration

We define the corresponding mocha/ts validation skeleton that exercises all twelve attack scenarios with their expected reject outcomes.

```typescript
// file: firestore.rules.test.ts
// Verifies that all Dirty Dozen payloads return PERMISSION_DENIED.
// Tested using @firebase/rules-unit-testing.
```
