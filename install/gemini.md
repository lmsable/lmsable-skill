# Use in Gemini

> Tested on a Google Workspace account (October 2026), with the Gemini interface in Polish. Menu names may differ on your account. If something looks different for you, tell us through [LMSable Help](https://lmsable.com/help/account/contact-and-bug-reports).

In Gemini you add LMSable as a **skill**. Google is replacing Gems with skills: existing Gems move to skills in March 2027, and from 1 March 2027 you can no longer create new Gems. If your account has no skills yet, use a Gem (Option B).

## Option A — Gemini skill (recommended)

1. Download [lmsable-skill.zip](https://github.com/lmsable/lmsable-skill/releases/latest/download/lmsable-skill.zip) and unzip it. Gemini does not accept the ZIP itself; it needs the `lmsable` folder with `SKILL.md` at its top level.
2. In Gemini, open **Customize** in the sidebar and go to the **Skills** tab.
3. Click **Create**, choose **Upload** and then **folder**, and select the unzipped `lmsable` folder.
4. The skill appears under **Active** as **lmsable**.
5. Start a new chat. Gemini uses the skill on its own when the chat is about LMSable.

## Option B — Gem

1. Download and unzip `lmsable-skill.zip`.
2. In the Gemini app, open **Gems** (Gem manager) and choose **New Gem**.
3. Name: for example "LMSable course helper". Do not present it as an official LMSable Gem.
4. **Instructions**: paste the contents of `SKILL.md` (without the `---` header at the top). If it is too long, use the short instructions from [install/chatgpt.md](chatgpt.md) and add `SKILL.md` as a file.
5. **Knowledge**: add `reference/authoring-format.md`, `reference/workflow.md` and the files from `examples/`.
6. Save the Gem and start a chat with it.

## Check

Attach a document and ask for a table of contents to import in LMSable. The answer should be one JSON block with `modules` and `lessons`, with nothing else inside the code block. Copy the block with its copy button: Gemini puts source chips (for example "PDF") next to the text, but not inside the code block.

## Working without a connector

Use the copy-and-paste route: copy the prompt from the LMSable Course Builder into Gemini, then paste the JSON answer back into LMSable. See [Import the table of contents](https://lmsable.com/help/build/import-table-of-contents) and [Fill a lesson](https://lmsable.com/help/build/fill-a-lesson).

Whether Gemini can connect to the LMSable MCP server depends on the Gemini product you use; see [reference/mcp-setup.md](../reference/mcp-setup.md).
