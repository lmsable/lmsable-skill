# Example 01 — Procedure PDF to course

Northwind Traders (logistics) wants short training for warehouse staff based on its procedure for damaged inbound shipments. The author pasted the PDF text into the chat and asked for a table of contents to import into the Course Builder, plus the first lesson.

Route: Builder import (**Lessons** step, then the lesson editor). With the MCP connector the same JSON goes to `create_course` (`toc`) and `set_lesson_blocks`.

## Input

Excerpt from the source document (`WH-07 Inbound damage procedure, rev. 2.pdf`):

```text
WH-07 INBOUND DAMAGE PROCEDURE — Revision 2
Applies to: receiving clerks and forklift operators, all Northwind Traders warehouses.

1. Before opening the trailer
1.1 Compare the seal number with the number on the bill of lading (BOL).
1.2 If the numbers do not match or the seal is missing, do not open the doors. Call the shift lead.
1.3 Photograph the seal and the trailer number before breaking the seal.
2. Unloading
2.1 Inspect each pallet as it comes off the trailer: crushed corners, wet cartons, broken wrap.
2.2 Move damaged pallets to the quarantine lane (yellow floor marking). Do not stack them.
2.3 Attach a red DAMAGED tag with the BOL number and the time.
3. Recording
3.1 Photograph each damaged pallet from two sides and the label.
3.2 Write "received with damage" and the pallet count on the driver's copy of the BOL before signing.
4. Claim
4.1 The receiving lead files the carrier claim in the WMS within 24 hours of unloading.
Note: a claim without a photo of the seal and a BOL remark is usually rejected by the carrier.
```

Author's brief: audience — new receiving clerks; goal — handle a damaged delivery without losing the claim; language — English; about 30 minutes in total.

## What the AI should produce

**Table of contents** (paste into **Paste the answer** on the **Lessons** step):

```json
{
  "modules": [
    {
      "title": "Before you open the trailer",
      "lessons": [
        {
          "title": "Why damage reports matter",
          "type": "lesson",
          "time": "4 min",
          "description": "Shows what Northwind loses when a damaged delivery is signed without a remark, and why the carrier rejects claims that lack evidence."
        },
        {
          "title": "Check the seal and paperwork",
          "type": "lesson",
          "time": "6 min",
          "description": "Compare the seal number with the bill of lading, decide whether you may open the doors, and record the evidence before breaking the seal."
        }
      ]
    },
    {
      "title": "Unloading and recording damage",
      "lessons": [
        {
          "title": "Spot and quarantine damaged pallets",
          "type": "lesson",
          "time": "6 min",
          "description": "Recognize the three common signs of damage, move the pallet to the quarantine lane and tag it correctly."
        },
        {
          "title": "Photos and the BOL remark",
          "type": "lesson",
          "time": "5 min",
          "description": "Take the photos a claim needs and write the damage remark on the driver's copy of the bill of lading before signing."
        },
        {
          "title": "From tag to claim in 24 hours",
          "type": "lesson",
          "time": "4 min",
          "description": "What the receiving lead needs from you so the carrier claim can be filed in the WMS within 24 hours."
        }
      ]
    },
    {
      "title": "Check your knowledge",
      "lessons": [
        {
          "title": "Damaged delivery check",
          "type": "quiz",
          "time": "5 min",
          "description": "Short graded check on the seal check, quarantine, photos and the BOL remark."
        }
      ]
    }
  ]
}
```

**Lesson "Check the seal and paperwork"** as a blocks document (paste into the lesson editor, or send with `set_lesson_blocks`):

```json
{
  "version": 1,
  "blocks": [
    {
      "type": "header",
      "text": "Check the seal and paperwork",
      "level": 2,
      "underline": true,
      "icon": "shield",
      "meta": "Procedure WH-07, revision 2 · Step 1 of 4"
    },
    {
      "type": "text",
      "html": "<p>The seal is the only proof that nobody opened the trailer between the shipper and our dock. If you break it without checking, Northwind cannot show where the damage happened, and the carrier can refuse the claim.</p>"
    },
    {
      "type": "statement",
      "variant": "warning",
      "html": "<p><strong>Seal number does not match, or no seal?</strong> Do not open the doors. Call the shift lead first.</p>"
    },
    {
      "type": "list",
      "style": "number",
      "title": "Before you break the seal",
      "items": [
        "Find the seal number on the bill of lading (BOL).",
        "Compare it with the number on the seal itself.",
        "Photograph the seal so the number is readable.",
        "Photograph the trailer number.",
        "Only then break the seal and open the doors."
      ]
    },
    {
      "type": "accordion",
      "items": [
        {
          "title": "The driver says he is late and cannot wait",
          "html": "<p>The driver may wait or leave; you still do not open a trailer with a wrong or missing seal. Note the time and tell the shift lead.</p>"
        },
        {
          "title": "The seal number differs by one digit",
          "html": "<p>Treat it as a mismatch. Typos on the BOL happen, but only the shift lead can confirm it with the shipper.</p>"
        }
      ]
    },
    {
      "type": "checklist",
      "items": [
        "Seal number matches the BOL",
        "Photo of the seal taken",
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
          "back": "The shift lead. The doors stay closed until then."
        }
      ]
    }
  ]
}
```

## Why it works

- The outline follows the order of the work on the dock, not the numbering of the PDF, and ends with a graded check (`"type": "quiz"`), which the Builder opens with the quiz editor attached.
- Every `description` states what the learner will be able to do; the Builder uses it when it builds the prompt for that lesson.
- The lesson is split into highlights: one `statement` for the stop rule, a numbered `list` for the sequence, an `accordion` for edge cases, a `checklist` and `flashcards` for recall — no single long `text` block.
- Only block types and fields from the contract are used, HTML is limited to `p` and `strong`, and there are no images, so no ids had to be invented. Photos of the seal can be added later in the editor; their ids come from the upload.
- Facts come from the source; the edge-case answers in the accordion are inferences and should be confirmed by the author before publishing.
