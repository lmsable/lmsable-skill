# Example 05 — Update an existing course through MCP

Northwind Traders revised its inbound damage procedure. The course from example 01 is already published, and the author wants the changed lesson updated in place, without rebuilding the course. The chat is connected to LMSable with **Read and edit** access (see `reference/mcp-setup.md`).

Route: MCP. Each step below shows the tool and its arguments; responses are described in words. Values in angle brackets and the lesson id are examples — in a real session they come from the previous response, never from a guess.

## Input

Author's message:

```text
Procedure WH-07 is now at revision 3. Please update the lesson "Check the seal and paperwork"
in the course "Damaged inbound shipments". Changes in revision 3:
1. If the seal number does not match or the seal is missing, call the Inbound Control desk
   (previously: the shift lead).
2. New rule: upload the seal photo in the Northwind Dock app before you break the seal.
Everything else stays the same.
```

## What the AI should produce

**1. Check the connection.** `ping` (no arguments). The response must show `server_mode` `read-write`. If it says `read-only`, stop here and give the author the changes to apply in the Course Builder.

**2. Load the contract.** `get_authoring_guide` (no arguments). Use the live block list and limits for every write below.

**3. Find the course.** `list_courses` (no arguments) returns the courses with their uuids. Pick "Damaged inbound shipments"; if two courses have similar titles, ask the author which one.

**4. Find the lesson.** `get_course`:

```json
{
  "course_uuid": "<course uuid from list_courses>"
}
```

The response lists modules and lessons with their ids. "Check the seal and paperwork" has, for example, lesson id `1042`.

**5. Read the lesson right before changing it.** `get_lesson`:

```json
{
  "course_uuid": "<course uuid from list_courses>",
  "lesson_id": 1042
}
```

The response returns the block document from example 01 and a version hash. Note the block positions: 0 `header`, 1 `text`, 2 `statement`, 3 `list`, 4 `accordion`, 5 `checklist`, 6 `flashcards`. Before writing, also scan the other blocks for the old rule: the accordion (block 4) mentions the shift lead in two answers. Report this to the author instead of guessing whether those answers should change.

**6. Validate the edit.** `edit_lesson_blocks` with `validate_only: true`. Block indexes refer to the lesson before the edit:

```json
{
  "course_uuid": "<course uuid from list_courses>",
  "lesson_id": 1042,
  "expected_version": "<version hash from get_lesson>",
  "validate_only": true,
  "ops": [
    {
      "op": "set_field",
      "block": 0,
      "field": "meta",
      "value": "Procedure WH-07, revision 3 · Step 1 of 4"
    },
    {
      "op": "replace_text",
      "block": 2,
      "field": "html",
      "find": "Call the shift lead first.",
      "replace": "Call the Inbound Control desk first."
    },
    {
      "op": "insert_block",
      "after": 3,
      "data": {
        "type": "statement",
        "variant": "info",
        "html": "<p><strong>New in revision 3:</strong> upload the seal photo in the Northwind Dock app before you break the seal.</p>"
      }
    }
  ]
}
```

**7. Write it.** If validation passes, send the same call without `validate_only` (or with `false`). If the server reports a version mismatch, the author changed the lesson in the browser meanwhile: call `get_lesson` again, rebuild the operations against the new content and the new version hash, and validate again.

**8. Report back.** Tell the author what changed (three edits, with the new text), that LMSable saved the previous lesson version before writing so it can be restored with `restore_lesson_revision`, and ask about the two accordion answers that still mention the shift lead.

**What the AI does not do:** it does not rewrite the whole lesson with `set_lesson_blocks`, does not delete or change the accordion on its own, and does not touch other lessons, even if they mention the old rule — it lists them and asks.

## Why it works

- The order `ping` → `get_authoring_guide` → `list_courses` → `get_course` → `get_lesson` → `edit_lesson_blocks` means no id is guessed and every write is checked against the live contract.
- `edit_lesson_blocks` makes three pointed changes (a field, a text replacement, one inserted block) instead of replacing the whole lesson, so anything the author edited by hand elsewhere in the lesson is kept.
- `expected_version` and `validate_only` protect the author's work: a stale read cannot overwrite browser edits, and a contract error is caught before anything is written.
- The `find` string is copied from the lesson exactly and occurs once in that field, which `replace_text` requires.
- Content outside the request (the accordion) is flagged, not changed, which keeps the author in control of the course.
