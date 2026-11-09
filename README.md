# Distractime
Track your remaining video time and real-time distraction metrics locally.

## What is Distractime? 

A small browser app that answers one question: **how much longer until this video ends?**

It can't see inside a YouTube tab, because browsers block that across sites. Instead, you type where you are in the video and how long it is, and the app uses your device's clock to work out the rest. It also splits your real time into **watched**, **distraction** and **paused**.

**Live site:** [LIVE URL](https://kris-amor.github.io/Distractime/)]

## Features

- Time remaining, shown as text and as a progress bar
- Two modes: type times by hand, or run a live clock
- Pause and resume, with paused time counted separately from distraction
- Totals for watched, distraction, paused and total real time
- Everything is saved in your browser and restored after a refresh
- Reset button that wipes all saved data
- An intro dialog on first visit, and a glossary at the bottom of the page

## How to use it

1. Type the **runtime** (how long the video is), and your **current time** in the video.
2. Choose a mode:
   - **Manual:** press **Calculate** each time you want to check in. The app compares your new time with your last entry. Video time you moved through counts as watched, and the rest of the real time counts as distraction. Rewinds count the same as moving forward.
   - **Auto:** press **Start**. A clock follows along. Use **Pause** when you step away on purpose, and press **Calculate** any time to type where you really are.
3. **Stop** ends the clock and keeps your totals. **Reset** wipes everything.

## How it works

- All times are stored as seconds. They're converted to hours, minutes and seconds only for display.
- Real time comes from `Date.now()`, not from counting timer ticks, so a late tick can't make the clock drift.
- Each check-in splits the real time since the last entry:
  - **Watched** grows by how far the video position moved.
  - **Distraction** grows by the active real time minus that movement.
  - **Paused** grows by the time you spent paused.
- The three buckets should add up to the total real time (watched + distraction + paused = total).

## Privacy and security

- Everything stays in your browser. The app never sends data anywhere, has no backend, and loads no outside scripts or libraries.
- Data is saved in `localStorage` under keys that start with `savedTracker:`.
- Text is written to the page with `.textContent` and `.value` only, never `innerHTML`, `eval` or `document.write`, so typed or saved values can't turn into code.
- Saved totals are checked when they load, and bad values such as `NaN` or negative totals are reset to 0.

## Testing

Test cases are in [`tests/test-cases.md`](tests/test-cases.md). Each expected value was worked out by hand first, then checked against the page. The tables cover manual-mode math, the live clock, pause and resume, and input normalizing. Timing is by hand, so a pass means within a few seconds.

## Known limits

- **Distraction can read negative.** If the video position moves faster than the clock (skipping ahead, or watching at 2x), the app assumes 1x speed.
- **No timeout.** A running clock keeps counting, and saved data stays until you press Reset.
- **Manual mode has no pause.**
- **Saved timestamps are only partly validated.** A tampered saved start time could confuse the clock until you press Reset.
- **The page was tested in [Google Chrome] only.**

## Project structure

```
index.html
style.css
js/main.js
tests/test-cases.md
README.md
```

## Planned for version 1.1

- "Are you still watching?" check-in with automatic data wipe
- Playback speed and skip prompts, which also fix negative distraction
- A circular progress ring with the time left in the center
- Closeable in-page messages in place of `alert()`
- Splitting `main.js` into separate modules
- Deployment to a private S3 bucket behind CloudFront using GitHub Actions and CloudFormation

## Built with

HTML, CSS and plain JavaScript. No libraries, no build step.
