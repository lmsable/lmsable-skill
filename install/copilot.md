# Use in Microsoft Copilot

> Tested on the free personal Microsoft Copilot (copilot.com, October 2026), with the interface in Polish. Menu names may differ on your account, and Microsoft 365 Copilot for work accounts looks different. If something looks different for you, tell us through [LMSable Help](https://lmsable.com/help/account/contact-and-bug-reports).

Copilot has no skill upload. You use the skill files as the references of a **Notebook**: every chat inside that notebook can read them.

## Create a notebook

1. Download [lmsable-skill.zip](https://github.com/lmsable/lmsable-skill/releases/latest/download/lmsable-skill.zip) and unzip it.
2. In Copilot, open **Notebooks** in the sidebar and choose **New notebook**. Name it, for example "LMSable courses", and click **Create**.
3. In the notebook panel, open **References**, click **Upload** and add `SKILL.md`, `reference/authoring-format.md`, `reference/workflow.md` and `reference/mcp-setup.md`.
4. Add your course material (for example a PDF procedure) to the same **References**.
5. Start your course chats inside that notebook.

## Check

Inside the notebook, ask for a table of contents from your material for import into LMSable. The answer should be one JSON block with `modules` and `lessons`. Copy the block with **Copy code**.

Chats outside the notebook do not see the skill files.

## Working without a connector

Copilot does not connect to the LMSable MCP server. Use the copy-and-paste route: see [Import the table of contents](https://lmsable.com/help/build/import-table-of-contents) and [Fill a lesson](https://lmsable.com/help/build/fill-a-lesson).
