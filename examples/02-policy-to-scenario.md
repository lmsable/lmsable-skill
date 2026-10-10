# Example 02 — Company policy to a branching scenario

Northwind Traders wants buyers and dispatchers to practice its gifts and hospitality policy on realistic situations, not by reading the policy again. The course already has a lesson of type **Scenario** called "A tender week at Northwind".

Route: Builder import (scenario editor) or MCP `set_lesson_scenario` (after `get_lesson` for `expected_version`).

## Input

Excerpt from `Gifts and Hospitality Policy, v4`:

```text
NORTHWIND TRADERS — GIFTS AND HOSPITALITY POLICY (v4)
Scope: all employees who deal with carriers, suppliers or customers.

1. You may accept a gift only if it is small, occasional and not given in cash or vouchers.
   Event tickets, travel and anything you would hesitate to show your manager are not "small".
2. Record every gift you accept in the Gift Register within 5 working days, whatever its value.
   Shared gifts (e.g. a box of chocolates for the team) are recorded by the person who received them.
3. While a tender is open, accept no gifts and no hospitality from any company taking part,
   including business meals.
4. If you accepted something you should not have, report it to your manager and return it.
   Late reporting is treated as a mistake; hiding it is treated as a breach.
5. Never share information about other bids. Requests for such information go to Compliance.
Contact: compliance@northwind.example
```

Author's brief: scored mode, pass mark 80, five to eight decisions on one path, one good and one bad ending.

## What the AI should produce

```json
{
  "version": 1,
  "mode": "scored",
  "passPercent": 80,
  "start": "tickets",
  "nodes": [
    {
      "id": "tickets",
      "title": "Two concert tickets",
      "html": "<p>It is Monday. The annual carrier tender opened last week. Dana, the account manager of one of the bidding carriers, stops by your desk with two VIP concert tickets: <em>\"Just a thank-you for a good year.\"</em></p>",
      "question": "What do you do?",
      "answers": [
        {
          "text": "Thank Dana and decline: the tender is open and tickets are not a small gift.",
          "to": "basket",
          "score": 1,
          "feedback": "Right. Event tickets are never a small gift, and during a tender nothing may be accepted from a bidder."
        },
        {
          "text": "Accept them. It is a thank-you for last year, not for the tender.",
          "to": "manager",
          "score": 0,
          "feedback": "The timing decides, not the intention. While the tender is open, nothing may be accepted from a bidder."
        },
        {
          "text": "Accept them and offer to pay Dana back later.",
          "to": "manager",
          "score": 0,
          "feedback": "Paying later does not change that you accepted hospitality from a bidder during a tender."
        }
      ]
    },
    {
      "id": "manager",
      "title": "A question from your manager",
      "html": "<p>On Wednesday your manager mentions that Dana's company is on the shortlist and asks whether you have had any contact with them outside meetings.</p>",
      "question": "How do you answer?",
      "answers": [
        {
          "text": "Tell your manager about the tickets and return them to Dana today.",
          "to": "basket",
          "score": 1,
          "feedback": "Reporting late is a mistake that can be fixed. Returning the tickets closes it."
        },
        {
          "text": "Say there was no contact. The concert is next month anyway.",
          "to": "end-breach",
          "score": 0,
          "feedback": "Hiding an accepted gift is treated as a breach, not as a mistake."
        }
      ]
    },
    {
      "id": "basket",
      "title": "A box of chocolates",
      "html": "<p>A courier delivers a box of chocolates addressed to you from a supplier that is not taking part in the tender. The card says <em>\"For the whole dispatch team.\"</em></p>",
      "question": "What do you do with it?",
      "answers": [
        {
          "text": "Share it with the team and record it in the Gift Register.",
          "to": "lunch",
          "score": 1,
          "feedback": "Correct. A small shared gift is fine, and the person who received it records it."
        },
        {
          "text": "Share it with the team. Chocolates are too small to record.",
          "to": "lunch",
          "score": 0,
          "feedback": "Every accepted gift is recorded, whatever its value."
        }
      ]
    },
    {
      "id": "lunch",
      "title": "A business lunch",
      "html": "<p>Another bidder invites you to a working lunch to \"walk through their offer\". They suggest a restaurant near the office and say the bill is on them.</p>",
      "question": "How do you respond?",
      "answers": [
        {
          "text": "Decline the lunch and offer a meeting at the Northwind office instead.",
          "to": "bids",
          "score": 1,
          "feedback": "Right. During a tender even business meals from a bidder are excluded; an office meeting is not."
        },
        {
          "text": "Accept, but insist on paying for your own meal.",
          "to": "bids",
          "score": 0,
          "feedback": "Paying your share is good practice outside a tender. During a tender, the policy excludes business meals with bidders."
        },
        {
          "text": "Accept. A working lunch is part of the job.",
          "to": "bids",
          "score": 0,
          "feedback": "The policy is explicit: no hospitality, including business meals, from a company taking part in an open tender."
        }
      ]
    },
    {
      "id": "bids",
      "title": "A colleague asks for numbers",
      "html": "<p>A colleague from sales, who is friends with one of the bidders, asks you over chat: <em>\"Roughly how far apart are the two lowest offers? Asking for a friend.\"</em></p>",
      "question": "What do you do?",
      "answers": [
        {
          "text": "Refuse and forward the request to Compliance.",
          "to": "end-clean",
          "score": 1,
          "feedback": "Correct. Information about other bids is never shared, and such requests go to Compliance."
        },
        {
          "text": "Give a rough range without naming the companies.",
          "to": "end-breach",
          "score": 0,
          "feedback": "A range is still information about other bids. It can change the outcome of the tender."
        },
        {
          "text": "Refuse, but keep the request to yourself to protect your colleague.",
          "to": "end-clean",
          "score": 0,
          "feedback": "Refusing is right, but the policy asks you to send such requests to Compliance."
        }
      ]
    },
    {
      "id": "end-clean",
      "ending": true,
      "title": "The tender closes cleanly",
      "html": "<p>The tender closes on Friday. Compliance reviews the file and finds every contact documented. Your decisions protected both you and the result of the tender.</p>",
      "result": "positive"
    },
    {
      "id": "end-breach",
      "ending": true,
      "title": "The tender is put on hold",
      "html": "<p>An internal review finds an undeclared contact with a bidder. The tender is put on hold and the award is delayed by a month. Review the policy and try again.</p>",
      "result": "negative"
    }
  ]
}
```

## Why it works

- Seven nodes (five decisions, two endings) within the 2-40 limit; every id matches the pattern, every `to` points at an existing node, and both endings are reachable from `start`.
- Each decision has two or three answers, each with `score` 0 or 1 as scored mode requires, and endings carry no `question` or `answers`.
- Every wrong answer gets feedback that quotes the rule it broke, so the learner learns from the mistake even before the ending.
- Distractors are realistic: "pay your own share" is a sensible habit that the policy excludes only during a tender, which is the point the scenario trains.
- Visible text stays within the limits (question 300, answer 200, feedback 500 characters) and the HTML uses only `p` and `em`.
