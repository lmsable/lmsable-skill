# Example 05 — Update an existing course through MCP

Northwind Traders revised its inbound damage procedure. The course from example 01 is already published, and the author wants it updated in place, without rebuilding the course. The chat is connected to LMSable with **Read and edit** access (see `reference/mcp-setup.md`).

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

The response returns the block document from example 01 and a version hash.

**6. Find every place the change touches.** Go through all blocks, not only the obvious one. Revision 3 changes two things, and they appear in five blocks:

| Block | What it says now | Change |
|---|---|---|
| 0 `header` | `meta`: revision 2 | revision 3 |
| 2 `statement` | Call the shift lead first. | Call the Inbound Control desk first. |
| 3 `list` | five steps before breaking the seal | add "Upload the seal photo in the Northwind Dock app." after "Photograph the seal." |
| 4 `accordion` | first item: call the shift lead | call the Inbound Control desk |
| 5 `checklist` | three checks | add "Seal photo uploaded in the Northwind Dock app" |
| 6 `flashcards` | second card: the shift lead | the Inbound Control desk |

Blocks 1 (text) and the second accordion item do not mention either rule and stay exactly as they are.

**7. Choose the write.** `edit_lesson_blocks` changes the text of existing content, but it cannot add a new item to a list or a checklist. Revision 3 adds a step to the list and a check to the checklist, so write the whole lesson with `set_lesson_blocks`: the document from step 5 with only the changes from the table. Validate first:

```json
{
  "course_uuid": "<course uuid from list_courses>",
  "lesson_id": 1042,
  "expected_version": "<version hash from get_lesson>",
  "validate_only": true,
  "blocks": {
    "version": 1,
    "blocks": [
      {
        "type": "header",
        "text": "Check the seal and paperwork",
        "level": 2,
        "underline": true,
        "icon": "shield",
        "meta": "Procedure WH-07, revision 3 · Step 1 of 4"
      },
      {
        "type": "text",
        "html": "<p>Before you open a trailer, you check its seal against the paperwork and photograph it. A carrier claim without a photo of the seal and a remark on the bill of lading is usually rejected, so these first steps protect Northwind's claim.</p>"
      },
      {
        "type": "statement",
        "variant": "warning",
        "html": "<p><strong>Seal number does not match, or no seal?</strong> Do not open the doors. Call the Inbound Control desk first.</p>"
      },
      {
        "type": "list",
        "style": "number",
        "title": "Before you break the seal",
        "items": [
          "Find the seal number on the bill of lading (BOL).",
          "Compare it with the number on the seal itself.",
          "Photograph the seal.",
          "Upload the seal photo in the Northwind Dock app.",
          "Photograph the trailer number.",
          "Only then break the seal and open the doors."
        ]
      },
      {
        "type": "accordion",
        "items": [
          {
            "title": "There is no seal at all",
            "html": "<p>A missing seal is handled like a wrong one: do not open the doors and call the Inbound Control desk.</p>"
          },
          {
            "title": "Why photograph the seal before breaking it?",
            "html": "<p>A carrier claim without a photo of the seal and a remark on the bill of lading is usually rejected.</p>"
          }
        ]
      },
      {
        "type": "checklist",
        "items": [
          "Seal number matches the BOL",
          "Photo of the seal taken",
          "Seal photo uploaded in the Northwind Dock app",
          "Photo of the trailer number taken"
        ]
      },
      {
        "type": "flashcards",
        "cards": [
          {
            "front": "What do you compare before opening the trailer?",
            "back": "The seal number with the seal number on the bill of lading."
          },
          {
            "front": "Who do you call if the seal is missing?",
            "back": "The Inbound Control desk. The doors stay closed until then."
          }
        ]
      }
    ]
  }
}
```

When the change only rewrites existing text and adds no items, use `edit_lesson_blocks` instead. Items inside a block are addressed by index from 0, so a single call can change the header, the statement, the first accordion item and the second flashcard and leave everything else untouched without resending the lesson. For example, if revision 3 had only changed who to call, the call would be (block indexes from the table in step 6; `find` must occur exactly once in that field):

```json
{
  "course_uuid": "<course uuid from list_courses>",
  "lesson_id": 1042,
  "expected_version": "<version hash from get_lesson>",
  "validate_only": true,
  "ops": [
    {"op": "set_field", "block": 0, "field": "meta", "value": "Procedure WH-07, revision 3 · Step 1 of 4"},
    {"op": "replace_text", "block": 2, "field": "html", "find": "the shift lead", "replace": "the Inbound Control desk"},
    {"op": "replace_text", "block": 4, "field": "items[0].html", "find": "the shift lead", "replace": "the Inbound Control desk"},
    {"op": "set_field", "block": 6, "field": "cards[1].back", "value": "The Inbound Control desk. The doors stay closed until then."}
  ]
}
```

The editable fields of every block type are listed in the "EDITING AN EXISTING LESSON" section of `get_authoring_guide`. An index past the end of a list (for example `items[5]` in a five-item list) is refused with "does not exist", and a field the block type does not allow is refused with the list of fields that can be edited.

**8. Write it.** If validation passes, send the same call without `validate_only`. If the server reports a version mismatch, the author changed the lesson in the browser meanwhile: call `get_lesson` again, apply the same changes to the new content and the new version hash, and validate again. Never resend the document from step 5 after a mismatch, because it would overwrite the author's edits.

**9. Check the rest of the course.** The rule may appear elsewhere. Call `get_lesson` for the other lessons that have content and look for the seal rule (who to call, the photos before breaking the seal). If another lesson repeats it, propose the same change and apply it once the author agrees. A mention of the shift lead in a different situation, one that revision 3 does not cover, stays as it is; mention it so the author can check it.

**10. Report back.** Tell the author:

- what changed in the lesson (the six edits from the table), and that LMSable saved the previous version first, so it can be restored with `restore_lesson_revision`;
- that the lesson no longer mentions the shift lead for a wrong or missing seal anywhere;
- which other lessons you checked and whether any of them still contradicts revision 3. If one does and the author has not decided yet, say that the course is not ready to publish until it is fixed.

## Why it works

- The order `ping` → `get_authoring_guide` → `list_courses` → `get_course` → `get_lesson` → write means no id is guessed and every write is checked against the live contract.
- The table in step 6 finds the old rule in five blocks, not just the statement where it is most visible. An update that changed only the statement would leave the accordion and a flashcard teaching the old rule, and learners would get two different answers in one lesson.
- The write method follows from what has to change: `set_lesson_blocks` when items have to be added to or removed from a list, `edit_lesson_blocks` when existing text only changes. In both cases everything the author did not ask to change stays exactly as it was.
- `expected_version` and `validate_only` protect the author's work: a stale read cannot overwrite browser edits, and a contract error is caught before anything is written.
- The update is reported as finished only when the whole course is consistent with revision 3, or the author knows exactly what is left.
