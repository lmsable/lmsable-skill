# Example 03 — Webinar transcript to a course with a quiz

Northwind Traders recorded a 45-minute internal webinar on cutting picking errors at its Dallas distribution center. The author pasted the transcript and asked for a short course: an outline, the key lesson and a five-question quiz.

Route: Builder import (outline on the **Lessons** step, then the lesson and quiz editors) or MCP (`create_course`, then `set_lesson_blocks` and `set_lesson_quiz`).

## Input

Excerpt from the transcript (`webinar-picking-errors-transcript.txt`):

```text
[00:02:10] Maria Lopez, Operations Manager: Last quarter about one order in two hundred left
Dallas with a wrong item. Each of those costs us a return, a reshipment and often the customer.
[00:05:40] Most errors come from three places: look-alike SKUs stored next to each other,
skipping the scan when the scanner is slow, and picking from the wrong level of the rack.
[00:11:15] What changed in Dallas: we stopped storing look-alikes side by side, we made the
scan mandatory — the handheld will not confirm a pick without it — and we added level labels.
[00:18:30] Scan the item, not the shelf label. Scanning the shelf proves you were in the right
place, not that you took the right thing.
[00:24:05] If the scanner says "wrong item", don't override it. Put the item back and call a lead.
[00:31:50] Short-picks are fine. Report them in the handheld. A short-pick is better than a wrong pick.
[00:38:20] "A wrong pick is three times the work of a right one: the pick, the return and the reship."
[00:42:00] Q&A: Yes, it applies to temps from day one. No, speed targets have not changed.
```

Author's brief: audience — pickers, including temporary staff; goal — follow the three habits that prevent wrong picks; language — English; about 20 minutes.

## What the AI should produce

**Table of contents:**

```json
{
  "modules": [
    {
      "title": "Why wrong picks matter",
      "lessons": [
        {
          "title": "The cost of one wrong pick",
          "type": "lesson",
          "time": "3 min",
          "description": "Explains what a wrong pick costs Northwind and the customer, using the figures from the Dallas webinar."
        }
      ]
    },
    {
      "title": "Three habits that prevent wrong picks",
      "lessons": [
        {
          "title": "Scan the item, not the shelf",
          "type": "lesson",
          "time": "6 min",
          "description": "The three common causes of wrong picks and the habits that prevent them: scan the item, check the rack level, never override a wrong-item alert."
        },
        {
          "title": "Short-pick instead of guessing",
          "type": "lesson",
          "time": "4 min",
          "description": "When an item is missing or doubtful, report a short-pick in the handheld instead of picking a look-alike."
        }
      ]
    },
    {
      "title": "Check",
      "lessons": [
        {
          "title": "Picking accuracy quiz",
          "type": "quiz",
          "time": "5 min",
          "description": "Five questions on scanning, rack levels, wrong-item alerts and short-picks."
        }
      ]
    }
  ]
}
```

**Lesson "Scan the item, not the shelf":**

```json
{
  "version": 1,
  "blocks": [
    {
      "type": "header",
      "text": "Scan the item, not the shelf",
      "level": 2,
      "underline": true,
      "meta": "From the Dallas picking-errors webinar"
    },
    {
      "type": "text",
      "html": "<p>Most wrong picks in Dallas came from three places. Each one has a simple habit that prevents it.</p>"
    },
    {
      "type": "table",
      "header": true,
      "rows": [
        ["Where errors come from", "The habit that prevents it"],
        ["Look-alike items stored next to each other", "Scan every item you pick"],
        ["Skipping the scan when the scanner is slow", "Wait for the scan; the handheld will not confirm without it"],
        ["Picking from the wrong rack level", "Check the level label before you reach"]
      ]
    },
    {
      "type": "statement",
      "variant": "highlight",
      "html": "<p><strong>Scan the item, not the shelf label.</strong> The shelf label only proves you were in the right place, not that you took the right thing.</p>"
    },
    {
      "type": "tabs",
      "items": [
        {
          "title": "Scanner says \"wrong item\"",
          "html": "<p>Do not override it. Put the item back and call a lead.</p>"
        },
        {
          "title": "Scanner is slow",
          "html": "<p>Wait for it. A skipped scan is how look-alikes leave the building.</p>"
        },
        {
          "title": "Item is not there",
          "html": "<p>Report a short-pick in the handheld. A short-pick is better than a wrong pick.</p>"
        }
      ]
    },
    {
      "type": "quote",
      "html": "<p>A wrong pick is three times the work of a right one: the pick, the return and the reship.</p>",
      "source": "Maria Lopez, Operations Manager"
    },
    {
      "type": "hidden",
      "label": "Does this apply to temporary staff?",
      "html": "<p>Yes, from the first day. Speed targets have not changed.</p>"
    }
  ]
}
```

**Lesson "Picking accuracy quiz"** (quiz editor, or `set_lesson_quiz`):

```json
{
  "version": 1,
  "settings": {
    "shuffleQuestions": true,
    "shuffleAnswers": true,
    "maxAttempts": 0,
    "passPercent": 80
  },
  "questions": [
    {
      "id": "q1",
      "type": "single",
      "text": "What should you scan to confirm a pick?",
      "options": [
        { "text": "The item you picked", "correct": true },
        { "text": "The shelf label", "correct": false },
        { "text": "The tote you put the item in", "correct": false }
      ],
      "feedback": {
        "correct": "Right. Only the item scan proves you took the right thing.",
        "incorrect": "The shelf label proves the location, not the item. Scan the item itself."
      }
    },
    {
      "id": "q2",
      "type": "multi",
      "text": "Which of these were the main causes of wrong picks in Dallas? Select all that apply.",
      "options": [
        { "text": "Look-alike items stored next to each other", "correct": true },
        { "text": "Skipping the scan when the scanner is slow", "correct": true },
        { "text": "Picking from the wrong rack level", "correct": true },
        { "text": "Orders printed in the wrong language", "correct": false }
      ],
      "feedback": {
        "correct": "Correct, those are the three causes from the webinar.",
        "incorrect": "The three causes were look-alikes side by side, skipped scans and the wrong rack level."
      }
    },
    {
      "id": "q3",
      "type": "single",
      "text": "The handheld shows \"wrong item\" but you are sure the item is right. What do you do?",
      "options": [
        { "text": "Put the item back and call a lead", "correct": true },
        { "text": "Override the alert to keep up the pace", "correct": false },
        { "text": "Pick it and add a note to the order", "correct": false }
      ],
      "feedback": {
        "correct": "Right. Never override a wrong-item alert.",
        "incorrect": "A wrong-item alert is never overridden. Put the item back and call a lead."
      }
    },
    {
      "id": "q4",
      "type": "truefalse",
      "text": "If the item is missing, it is better to pick a look-alike than to report a short-pick.",
      "answer": false,
      "feedback": {
        "correct": "Correct. A short-pick is better than a wrong pick.",
        "incorrect": "A short-pick is better than a wrong pick. Report it in the handheld."
      }
    },
    {
      "id": "q5",
      "type": "truefalse",
      "text": "The scanning rules apply to temporary staff from their first day.",
      "answer": true,
      "feedback": {
        "correct": "Right. The rules apply to everyone from day one.",
        "incorrect": "They do apply from day one, to temporary staff as well."
      }
    }
  ]
}
```

## Why it works

- The transcript is reorganized by what the picker has to do, not by the timeline of the talk; the Q&A answers end up where they are useful (a `hidden` block, quiz question 5).
- The lesson uses a `table` for cause → habit, one `statement` for the key rule, `tabs` for three situations and a `quote` from the speaker — the presenter's own line is kept as a quote rather than rewritten.
- The quiz mixes types as asked: two `single`, one `multi` (all-or-nothing scoring, so the prompt says "Select all that apply"), two `truefalse` with `answer` and no `options`.
- Ids `q1`–`q5` match the pattern, each question has 2-6 options where options are allowed, and `timeLimitSeconds` is left out because a time limit was not requested.
- Every quiz question is answerable from the lessons; none tests a detail that only appeared in the recording.
