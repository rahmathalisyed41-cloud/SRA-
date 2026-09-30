# Security Specification - SRA Goat for Sale Hyderabad

## 1. Data Invariants
- A listing must belong to the authenticated seller (`sellerId == request.auth.uid`).
- A user profile can only be modified by its owner (`userId == request.auth.uid`) or an administrator.
- Role elevation to ADMIN cannot be performed by normal users. Admin email `rahmathalisyed41@gmail.com` is bootstrapped.
- An animal Short reel must have an authentic video URL and owner matching `sellerId`.
- Likes and favorites are strictly bound to `userId == request.auth.uid`.
- Breeds and Admin Settings can only be modified by verified Admins.

## 2. The "Dirty Dozen" Payloads (Targeting Exploits)
1. User A attempts to update Listing owned by User B -> PERMISSION_DENIED
2. Unauthenticated user attempts to create a listing -> PERMISSION_DENIED
3. User attempts to self-assign role: "ADMIN" during user profile create -> PERMISSION_DENIED
4. User A attempts to delete Short created by User B -> PERMISSION_DENIED
5. User A creates a comment with `userId: User B` -> PERMISSION_DENIED
6. User attempts to modify `adminSettings` without admin privileges -> PERMISSION_DENIED
7. User creates a listing with oversized ID or script tags -> PERMISSION_DENIED
8. User creates a favorite with someone else's `userId` -> PERMISSION_DENIED
9. User attempts to list draft/deleted listings of other sellers -> PERMISSION_DENIED
10. Unauthenticated client attempts to wipe the `/breeds` catalog -> PERMISSION_DENIED
11. User attempts to alter `createdAt` immutable timestamp on listing update -> PERMISSION_DENIED
12. Malicious user tries to inject arbitrary fields not in listing schema -> PERMISSION_DENIED
