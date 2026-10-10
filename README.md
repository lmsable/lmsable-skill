# LMSable skill for AI chats

A knowledge pack that teaches your AI chat how [LMSable](https://lmsable.com) works and which format it accepts, so the course outlines, lessons, quizzes and scenarios it writes import into LMSable without rework.

It works as a Claude Skill and as plain instructions for ChatGPT and Gemini.

**Status: public beta (0.9.2).** The format and examples are checked against the live LMSable server; the ChatGPT and Gemini setup steps are still being tested. Feedback is welcome through [LMSable Help](https://lmsable.com/help/account/contact-and-bug-reports).

**Quick start for Claude:** download [lmsable-skill.zip](https://github.com/lmsable/lmsable-skill/releases/latest/download/lmsable-skill.zip) and upload it in Claude under **Customize → Skills** ([details](install/claude.md)).

## What is in it

| Path | Contents |
|---|---|
| `SKILL.md` | When to use the skill, how LMSable works, ground rules for the AI |
| `reference/authoring-format.md` | The content contract: table of contents, 22 block types, HTML rules, quiz, scenario. Generated from the LMSable server, not written by hand |
| `reference/mcp-setup.md` | Connecting LMSable to your chat (MCP) and the list of tools |
| `reference/workflow.md` | Task → route in LMSable, with Help articles and videos |
| `examples/` | Five worked examples for a fictional company, Northwind Traders |
| `install/` | Setup steps for Claude, ChatGPT and Gemini |
| `tools/generate-reference.mjs` | Regenerates `reference/authoring-format.md` from a saved `get_authoring_guide` response |
| `tools/check-examples.mjs` | Checks every JSON in `examples/` against the contract (block types and fields, limits, allowed HTML, quiz and scenario rules) and runs the negative cases in `tests/negative/`. Runs on every push |

## Install

- **Claude**: [install/claude.md](install/claude.md) — upload as a Skill, or add `SKILL.md` to a Project.
- **ChatGPT**: [install/chatgpt.md](install/chatgpt.md) — Custom GPT or Project instructions.
- **Gemini**: [install/gemini.md](install/gemini.md) — Gem instructions.

To let the chat read and edit your courses directly, also connect LMSable: [reference/mcp-setup.md](reference/mcp-setup.md).

## FAQ

**Do I need an LMSable account to use the skill?**
No account is needed to have the chat draft an outline or a lesson. To import the result, and to connect the chat to your courses, you need an LMSable account.

**Do I need the MCP connector?**
No. Without it you copy the prompt from the Course Builder into your chat and paste the answer back. The connector saves the copying and lets the chat read your existing courses. What the connector can do on your plan is described in [Free and Pro](https://lmsable.com/help/account/free-and-pro).

**Which plan do I need, and what does it cost?**
See [lmsable.com/pricing](https://lmsable.com/pricing) and [Free and Pro: what is included](https://lmsable.com/help/account/free-and-pro). This repository does not list prices or limits because they change.

**The import fails with a JSON error. What now?**
Usually the answer was cut short or has extra text around it. Ask the chat to repeat the full JSON in one code block and paste it without changes. More in [Import the table of contents](https://lmsable.com/help/build/import-table-of-contents).

**Is this skill up to date with LMSable?**
The format in `reference/authoring-format.md` is a snapshot with a date. When the chat is connected through MCP, the skill tells it to fetch the current format with `get_authoring_guide` first, so the live version is always used. New releases of this repository follow format changes.

**Does LMSable send my documents to an AI service?**
The skill runs in your own chat; what you paste there is governed by your chat provider. For how LMSable itself handles your data, see [Your data and privacy](https://lmsable.com/help/account/privacy-and-deleting-your-account).

## Support

Questions and bug reports go through LMSable Help: https://lmsable.com/help (see [Contact and bug reports](https://lmsable.com/help/account/contact-and-bug-reports)). Issues are not tracked in this repository.

## License and trademark

The contents of this repository are released under the MIT License (see [LICENSE](LICENSE)).

LMSable is a trademark of eTechnologie Sp. z o.o. The MIT License covers the skill files only; it does not grant any right to use the LMSable name or logo, and you may not modify the LMSable brand or present a modified copy of this skill as an official LMSable release.
