# Example 04 — Onboarding course from three files

Northwind Traders wants one onboarding course for new office staff at its headquarters. HR gave the author three documents. The author asked for a complete outline with lesson drafts, so that the text lessons are not empty after the import.

Route: Builder import (**Lessons** step) or MCP `create_course` with `toc`. In both cases the `content` field of a lesson becomes a draft of a text lesson that the author then edits with blocks.

## Input

Three sources, excerpts:

```text
FILE 1 — Employee Handbook (HR-01), section "Your first week"
- Working hours are flexible between 7:00 and 19:00; core hours 10:00-15:00.
- Time off is requested in the HR portal at least 5 working days ahead.
- Your buddy is your first contact for practical questions during the first month.

FILE 2 — IT starter sheet (IT-03)
- Sign in to your laptop with the temporary password from your welcome e-mail; you must change it on first sign-in.
- Turn on two-step verification in the first week. Without it, remote access stops after 7 days.
- Report suspicious e-mails with the "Report phishing" button. Never forward them.

FILE 3 — Headquarters safety induction (HS-02)
- Fire assembly point: parking lot B, by the flagpole.
- The warehouse floor behind the yellow doors is off limits without a hi-vis vest and an escort.
- Report every accident or near miss to reception the same day.
```

Author's brief: audience — new office employees at headquarters; goal — be able to work safely and independently by the end of week one; language — English; three modules, one per file, plus a short final check.

## What the AI should produce

```json
{
  "modules": [
    {
      "title": "Your first week at Northwind",
      "lessons": [
        {
          "title": "Working hours and time off",
          "type": "lesson",
          "time": "4 min",
          "description": "Learners can plan their week within flexible and core hours and know how far ahead to request time off.",
          "content": "Working hours are flexible between 7:00 and 19:00. Core hours are 10:00 to 15:00. Request time off in the HR portal at least 5 working days ahead."
        },
        {
          "title": "Your buddy",
          "type": "lesson",
          "time": "3 min",
          "description": "Learners know that their buddy is the first contact for practical questions during the first month.",
          "content": "During your first month you have a buddy. Your buddy is your first contact for practical questions."
        }
      ]
    },
    {
      "title": "Getting set up with IT",
      "lessons": [
        {
          "title": "First sign-in and two-step verification",
          "type": "lesson",
          "time": "5 min",
          "description": "Learners can sign in for the first time, change the temporary password and turn on two-step verification before remote access is blocked.",
          "content": "Sign in to your laptop with the temporary password from your welcome e-mail. You will be asked to choose a new password straight away. Then turn on two-step verification during your first week: without it, remote access stops working after 7 days."
        },
        {
          "title": "Suspicious e-mails",
          "type": "lesson",
          "time": "4 min",
          "description": "Learners report a suspicious e-mail with the Report phishing button instead of forwarding it.",
          "content": "Report every suspicious e-mail with the Report phishing button. Never forward it."
        }
      ]
    },
    {
      "title": "Safety at headquarters",
      "lessons": [
        {
          "title": "Fire assembly point",
          "type": "lesson",
          "time": "3 min",
          "description": "Learners know where the fire assembly point is.",
          "content": "The fire assembly point is in parking lot B, by the flagpole."
        },
        {
          "title": "The warehouse floor and reporting accidents",
          "type": "lesson",
          "time": "4 min",
          "description": "Learners know the rules for entering the warehouse floor and report accidents and near misses the same day.",
          "content": "The warehouse floor behind the yellow doors is off limits without a hi-vis vest and an escort. Report every accident or near miss to reception on the same day."
        }
      ]
    },
    {
      "title": "Final check",
      "lessons": [
        {
          "title": "Week one check",
          "type": "test",
          "time": "6 min",
          "description": "A graded test covering hours and time off, sign-in and two-step verification, phishing reports, the assembly point and warehouse access."
        }
      ]
    }
  ]
}
```

**Questions for the author** (outside the JSON):

- What should a new employee do when the fire alarm sounds? HS-02 only names the assembly point; the lesson is short until you add the alarm procedure.
- Who is the buddy, and how do new employees learn who theirs is? What kind of questions should go to the buddy rather than to HR or IT?
- Who can act as an escort on the warehouse floor?

## Why it works

- One module per source keeps the course traceable: when HR updates the handbook, the author knows which module to update.
- Every `description` is a learning outcome ("Learners can..."), plain text and well under the 500-character limit.
- Every text lesson carries a short `content` draft built only from the source, so the author starts from facts instead of an empty lesson and adds highlights (a `statement` for the 7-day rule, a `checklist` for the first sign-in) in the editor.
- The final lesson is `"type": "test"` without `content`: a test is filled with questions in the quiz editor or with `set_lesson_quiz`, and by default a new test lesson limits attempts.
- The drafts say exactly what the sources say and nothing more. Short lessons (the buddy, the assembly point) stay short rather than being padded with plausible but invented duties or alarm steps; the gaps go to the questions after the code block, where the author can fill them with the company's real rules.
