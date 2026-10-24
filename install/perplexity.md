# Install in Perplexity

Perplexity accepts the same ZIP as Claude. Skills work only in **Computer** mode, which uses Perplexity credits (a short question about LMSable used about 10 credits in our test). In the normal search mode Perplexity does not use the skill. Menu names in Perplexity change from time to time; if a step does not match what you see, check Perplexity's own help for "Skills".

## Upload the skill

1. Download the ready-made package: [lmsable-skill.zip](https://github.com/lmsable/lmsable-skill/releases/latest/download/lmsable-skill.zip) from the latest release. Do not unzip it.
2. In Perplexity, open **Plugins** from the sidebar.
3. Click **Add custom** and choose **Upload plugin or skill**.
4. Drop `lmsable-skill.zip` into the window and click **Upload**. Perplexity opens the page of the new skill, **lmsable**, with its files listed and the switch on.
5. Check: start a new task, switch the mode from **Search** to **Computer** and ask "Using the lmsable skill, propose a table of contents for a 20-minute course on fire safety for warehouse staff." The answer should be one JSON block with `modules` and `lessons`.

## Without Computer mode

In the normal search mode, paste the contents of `SKILL.md` (without the `---` header at the top) at the start of the conversation, or put it in a Perplexity Space as instructions and add the files from `reference/` and `examples/` to that Space.

## Connect LMSable as well

The skill teaches Perplexity the format. To let Perplexity read and edit your courses directly, add the LMSable connector (Perplexity Pro, works in the normal search mode): [reference/mcp-setup.md](../reference/mcp-setup.md) and [Connect Perplexity with a custom MCP connector](https://lmsable.com/help/ai-chat/connect-perplexity).

## Update

Download `lmsable-skill.zip` from the newest release. Under **Plugins**, open the **lmsable** skill, open the **...** menu, choose **Replace** and upload the new ZIP. The version and date are at the end of `SKILL.md`.
