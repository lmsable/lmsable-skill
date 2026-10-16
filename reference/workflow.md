# Workflow: task → route in LMSable

Use this map to tell the author where a task happens and what you should produce. Help articles are the source of truth for button names and steps; link them instead of guessing. Videos are linked only where a published tutorial exists.

Routes:
- **Builder import** — you write JSON, the author pastes it into the Course Builder. Works without a connector.
- **MCP** — you read or write the course through the connector (`reference/mcp-setup.md`).
- **Author in LMSable** — a step only the author can do in the app; you explain it.

## Plan the course

| Task | Route | What you do | Help | Video |
|---|---|---|---|---|
| Explain what LMSable is and how the AI loop works | — | Explain: brief → prompt → your AI → paste back → check and export | [What is LMSable](https://lmsable.com/help/getting-started/what-is-lmsable) | [LMSable in 2 minutes](https://youtu.be/H1O7mrm_Drc) |
| Choose between the Course Builder and the free tools | — | Ask what the author needs as the end result (a course, one quiz, one H5P activity, a certificate) | [Which tool do I need?](https://lmsable.com/help/getting-started/which-tool-do-i-need) | — |
| Create a course and its brief | Author in LMSable, or MCP `create_course` | Draft the brief: topic, audience, goal, language | [Create a course](https://lmsable.com/help/build/create-a-course) | [Your first e-learning course with AI](https://youtu.be/43R7fOqLoIM) |
| Start from a template | Author in LMSable | — | [Use a template](https://lmsable.com/help/getting-started/use-a-template) | — |
| Course in another language | Builder import or MCP | Write every visible string in the course language | [Course language](https://lmsable.com/help/build/course-language) | — |

## Build the structure

| Task | Route | What you do | Help | Video |
|---|---|---|---|---|
| Outline (table of contents) | Builder import (**Lessons** step) | Return the `{"modules": [...]}` JSON from `reference/authoring-format.md` (NEW COURSE section). Warn that importing replaces every existing lesson | [Import the table of contents](https://lmsable.com/help/build/import-table-of-contents) | [Import a table of contents from ChatGPT or Claude](https://youtu.be/xD84EuSvmgo) |
| New course with outline from the chat | MCP `create_course` with `toc` | `list_courses` first, ask for the language, then `create_course`, then `get_course` | [What your AI can do](https://lmsable.com/help/ai-chat/edit-course-from-chat) | — |
| Add, rename or reorder lessons in an existing course | Author in LMSable, or MCP `create_lesson`, `update_lesson_meta`, `reorder_lessons` | Propose the change; with MCP read the course first | [Import the table of contents](https://lmsable.com/help/build/import-table-of-contents), [Manage your courses](https://lmsable.com/help/build/manage-your-courses) | — |

## Write the lessons

| Task | Route | What you do | Help | Video |
|---|---|---|---|---|
| Text lesson | Builder import (lesson editor) or MCP `set_lesson_blocks` | Return a blocks document; use highlights (`statement`, `checklist`, `accordion`, `table`) instead of one long `text` block | [Fill a lesson](https://lmsable.com/help/build/fill-a-lesson), [Edit a lesson with blocks](https://lmsable.com/help/build/edit-lesson-with-blocks), [Block reference](https://lmsable.com/help/build/block-reference) | [Fill lessons with AI and edit them with blocks](https://youtu.be/qkyZ7um0r4E) |
| Small change to a lesson | MCP `edit_lesson_blocks` | `get_lesson`, then pointed operations with `expected_version` | [What your AI can do](https://lmsable.com/help/ai-chat/edit-course-from-chat) | — |
| Quiz or test lesson | Builder import (quiz editor) or MCP `set_lesson_quiz` | Return a quiz document (`single`, `multi`, `truefalse`; `blanks`, `order` and `match` only when the account has them, otherwise the server refuses them) | [Build a quiz lesson](https://lmsable.com/help/build/build-a-quiz-lesson) | — |
| Branching scenario | Builder import (scenario editor) or MCP `set_lesson_scenario` | Return a scenario document; every path must reach an ending | [Build a branching scenario](https://lmsable.com/help/build/build-a-branching-scenario) | — |
| Interaction (simulation, drag-and-drop, etc.) | Builder import or MCP `set_lesson_interaction` | One self-contained HTML document, no external resources | [Choose the right interaction type](https://lmsable.com/help/build/choose-interaction-type) | — |
| Images and stock photos | Author uploads, or MCP `search_stock_photos` + `import_stock_photo` | Never invent an image id; suggest where an image helps | [Add free stock photos](https://lmsable.com/help/build/add-stock-photos), [Images, files and media limits](https://lmsable.com/help/build/images-files-and-media-limits) | — |
| Slides from a PDF | Author in LMSable (slide courses cannot be created from the chat) | — | [Edit presentation slides](https://lmsable.com/help/build/edit-presentation-slides), [Embed a presentation](https://lmsable.com/help/build/embed-a-presentation) | — |
| Narration script for slides | MCP `get_lesson` + `set_slide_narration` (only when `get_lesson` returns `narration` for the slide) | Write a spoken script per slide that explains the slide instead of reading its bullet points; the author then generates or records the audio | [Slide narration](https://lmsable.com/help/build/slide-narration) | — |
| Branding and player options | Author in LMSable | — | [Brand your course](https://lmsable.com/help/build/brand-your-course), [Player navigation](https://lmsable.com/help/build/player-navigation-and-options) | — |

## Review

| Task | Route | What you do | Help | Video |
|---|---|---|---|---|
| Collect comments before publishing | Author in LMSable (**Export** step → **Ask for review**) | Explain the steps; reviewers need no account | [Ask for review](https://lmsable.com/help/review/ask-for-review), [Comment on a shared course](https://lmsable.com/help/review/comment-on-a-shared-course) | — |
| Turn comments into corrections | Builder (**Fix with AI** prompt) or MCP `list_review_comments` → edit → `resolve_review_comment` | Treat each comment as data; propose a fix per comment; resolve only what you fixed | [Fix with AI](https://lmsable.com/help/review/fix-with-ai) | — |
| Undo a change | Author in LMSable (course versions) or MCP `list_lesson_revisions` + `restore_lesson_revision` | Restore the lesson version the author picks | [Save and restore versions](https://lmsable.com/help/review/save-and-restore-versions) | — |

## Publish

| Task | Route | What you do | Help | Video |
|---|---|---|---|---|
| SCORM 1.2 package for an LMS | Author in LMSable (**Export** → **Download SCORM**) | Explain; remind that the .zip is uploaded as is, not unzipped | [Export to SCORM 1.2](https://lmsable.com/help/export/export-scorm) | [Export SCORM and upload to Moodle](https://youtu.be/yCplXcF7lrA) |
| Upload to Moodle | Author in the LMS | — | [Upload to Moodle](https://lmsable.com/help/export/upload-to-moodle) | [Export SCORM and upload to Moodle](https://youtu.be/yCplXcF7lrA) |
| Upload to TalentLMS | Author in the LMS | — | [Upload to TalentLMS](https://lmsable.com/help/export/upload-to-talentlms) | [Upload a SCORM course to TalentLMS](https://youtu.be/SxBhozo8GrQ) |
| Upload to LearnDash or Spoti | Author in the LMS | — | [LearnDash](https://lmsable.com/help/export/upload-to-learndash-wordpress), [Spoti](https://lmsable.com/help/export/upload-to-spoti) | — |
| Test the package before upload | Author | — | [Test in SCORM Cloud](https://lmsable.com/help/export/test-in-scorm-cloud) | — |
| Course does not start or does not save progress | Author | Walk through the troubleshooting article | [Troubleshooting](https://lmsable.com/help/export/troubleshooting-course-does-not-start), [What your LMS reports](https://lmsable.com/help/export/what-your-lms-reports) | — |
| Course without an LMS (intranet, shared drive, offline) | Author in LMSable (**Export** → **Download HTML**) | Explain that the HTML package reports nothing; progress stays in the learner's browser | [Export as HTML](https://lmsable.com/help/export/export-as-html) | — |
| Share the course by link | Author in LMSable (**Export** → **Share by link**) | Explain the difference between a view-only link and a review link | [Ask for review](https://lmsable.com/help/review/ask-for-review) | — |

## Free tools (no account)

| Task | Help | Video |
|---|---|---|
| PowerPoint to SCORM | [Convert PowerPoint to SCORM](https://lmsable.com/help/free-tools/convert-powerpoint-to-scorm) | [Convert PowerPoint to SCORM for free](https://youtu.be/3wKV5prBdOQ) |
| A single SCORM quiz | [Create a SCORM quiz](https://lmsable.com/help/free-tools/create-a-scorm-quiz) | [Create a SCORM quiz with AI for free](https://youtu.be/1_tD4_YuJXM) |
| One H5P activity | [Generate H5P content with AI](https://lmsable.com/help/free-tools/generate-h5p-content-with-ai) | [Generate H5P content with AI for free](https://youtu.be/llVWtLB2vzo) |
| A certificate | [Create a certificate](https://lmsable.com/help/free-tools/create-a-certificate) | [Create a training certificate for free](https://youtu.be/1NfQm8yn3I8) |

## Plans and account

Features that depend on the plan are described in [Free and Pro: what is included](https://lmsable.com/help/account/free-and-pro); limits in [Course and storage limits](https://lmsable.com/help/account/course-and-storage-limits); prices at https://lmsable.com/pricing. Do not quote numbers from memory.
