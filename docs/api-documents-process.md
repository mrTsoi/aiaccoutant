# POST /api/documents/process

Trigger AI processing for a document.

Request body

- `documentId` (string) — ID of the document to process.

Response

Returns JSON with the following fields:

- `success` (boolean)
- `message` (string)
- `documentId` (string)
- `validationStatus` (string, optional) — e.g. `COMPLETE` or `NEEDS_REVIEW`.
- `validationFlags` (array, optional) — flags like `DUPLICATE_DOCUMENT`, `WRONG_TENANT`.
- `tenantCandidates` (array, optional) — suggested tenant matches when a tenant mismatch is detected.
- `isMultiTenant` (boolean, optional) — whether multiple tenant matches were found.
- `tenantCorrection` (object, optional) — info about any automatic tenant reassignment or creation.
- `recordsCreated` (boolean, optional)
  - If `true` (default), the processor created ledger/bank records (statements or transactions).
  - If `false`, the processor intentionally did not create records. Typical reasons:
    - Document is a duplicate and there was no existing transaction to update.
    - Document was flagged as `WRONG_TENANT` and no automatic tenant correction was applied.
  - UI should surface a review flow or an explicit "Create Transaction" override when `recordsCreated:false`.

Notes

- The endpoint requires an authenticated user who is a member of the document's tenant and with AI automation feature access.
- The API returns detailed validation info to allow the frontend to guide user review and avoid duplicate ledger entries.
