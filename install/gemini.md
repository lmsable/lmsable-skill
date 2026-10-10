# Use in Gemini

> Beta: these steps are still being tested on different Google accounts and plans. If something looks different for you, tell us through [LMSable Help](https://lmsable.com/help/account/contact-and-bug-reports).

Gemini has no skill format, so the skill is used as the instructions of a Gem, with the reference files attached as knowledge. Availability of Gems and file uploads depends on your Google account and plan.

## Create a Gem

1. In the Gemini app, open **Gems** (Gem manager) and choose **New Gem**.
2. Name: for example "LMSable course helper". Do not present it as an official LMSable Gem.
3. **Instructions**: paste the contents of `SKILL.md` (without the `---` header at the top). If it is too long, use the short instructions from [install/chatgpt.md](chatgpt.md) and add `SKILL.md` as a file.
4. **Knowledge**: add `reference/authoring-format.md`, `reference/workflow.md` and the files from `examples/`.
5. Save the Gem and start a chat with it.

## Check

Ask: "Propose a table of contents for a 20-minute course on fire safety for warehouse staff, in the LMSable import format." The answer should be one JSON block with `modules` and `lessons`, with nothing else inside the code block.

## Working without a connector

Use the copy-and-paste route: copy the prompt from the LMSable Course Builder into the Gem, then paste the JSON answer back into LMSable. See [Import the table of contents](https://lmsable.com/help/build/import-table-of-contents) and [Fill a lesson](https://lmsable.com/help/build/fill-a-lesson).

Whether Gemini can connect to the LMSable MCP server depends on the Gemini product you use; see [reference/mcp-setup.md](../reference/mcp-setup.md).
