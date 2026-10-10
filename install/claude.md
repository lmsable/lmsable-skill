# Install in Claude

Two options: upload the folder as a Skill (recommended), or add the files to a Claude Project. Menu names in Claude change from time to time; if a step does not match what you see, check Claude's own help for "Skills".

## Option A — Claude Skill (web and desktop)

1. Download the ready-made package: [lmsable-skill.zip](https://github.com/lmsable/lmsable-skill/releases/latest/download/lmsable-skill.zip) from the latest release. Do not unzip it: it already contains the `lmsable` folder with `SKILL.md`, `reference/` and `examples/`.
2. Make sure code execution is on: **Settings → Capabilities**. Skills need it.
3. Open **Customize** in the sidebar and go to **Skills**.
4. Click **+**, then **+ Create skill**, choose **Upload a skill** and select `lmsable-skill.zip`. On Team and Enterprise plans an Owner can turn skill uploads off; ask them if the option is missing.

These steps follow Anthropic's guide [Use skills in Claude](https://support.claude.com/en/articles/12512180-use-skills-in-claude).
5. Check: start a new chat and ask "Using the LMSable skill, propose a table of contents for a 20-minute course on fire safety for warehouse staff." The answer should be one JSON block with `modules` and `lessons`.

Claude loads the skill on its own when a conversation is about LMSable or course building. You can also mention it by name.

## Option B — Claude Project

Use this when Skills are not available on your account.

1. Create a Project, for example "LMSable courses".
2. Paste the contents of `SKILL.md` (without the `---` header at the top) into the Project instructions.
3. Add `reference/authoring-format.md`, `reference/workflow.md` and the files from `examples/` to the Project knowledge.
4. Start chats about your courses inside that Project.

## Claude Code

Unzip `lmsable-skill.zip` and copy the `lmsable` folder to `~/.claude/skills/lmsable/` (or `.claude/skills/lmsable/` inside a project). Claude Code picks it up in the next session.

## Connect LMSable as well

The skill teaches Claude the format. To let Claude read and edit your courses directly, add the LMSable connector: [reference/mcp-setup.md](../reference/mcp-setup.md) and [Connect Claude with a connector](https://lmsable.com/help/ai-chat/connect-claude-web).

## Update

Download `lmsable-skill.zip` from the newest release and replace the old skill (Option A: delete the old skill and upload the new ZIP; Option B: replace the files and instructions). The version and date are at the end of `SKILL.md`.
