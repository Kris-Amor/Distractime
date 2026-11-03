# Test Cases

Hand-made table for the watched/distraction math (Stage 4).
Work out the expected values on paper first, then run the same inputs in the page.

## Rule being tested

On each click after the first:

- `realElapsedSecs` = real seconds since the previous click
- `timeMovedSecs` = |new time - previous time|
- watched grows by `timeMovedSecs`
- distraction grows by `realElapsedSecs - timeMovedSecs`
- **Invariant:** watched + distraction = real seconds elapsed

## How to test

1. Refresh the page (resets the totals and the first-click state). Click "reset" to remove the saved data.
2. Click Calculate with the "previous time" values (this only saves the baseline).
3. Wait the "real seconds" shown below.
4. Enter the "new time" and click Calculate.
5. Compare the page and Console to the expected columns.

Real time comes from a human clicking, so expect to be off by a second or two. Check that the numbers are close, not identical.

## Cases

### Manual Mode

| # | Test | Previous time | New time | Real seconds | Expected watched | Expected distraction | Expected Pause | Total Check |
|---|------|---------------|----------|--------------|------------------|----------------------|----------------|-------------| 
| 1 | Watched straight through | 1:05 (65) | 1:25 (85) | 20 | 20 | 0 | 0 | 20 + 0 + 0 = 20 |
| 2 | Distracted partway | 1:05 (65) | 1:35 (95) | 40 | 30 | 10 | 0 | 30 + 10 + 0 = 40 |
| 3 | Rewind | 1:05 (65) | 0:35 (35) | 50 | 30 | 20 | 0 | 30 + 20  0 = 50 |
| 4 | Same time re-entered | 1:05 (65) | 1:05 (65) | 20 | 0 | 20 | 0|  0 + 20 + 0 = 20 |
| 5 | Paused Time | 1:05 (65) | 1:05 (65) | 20 | 0 | 0 | 20 | 0 + 0 + 20 |

Note: Row 5 is still shelved for Manual Mode. Columns for Paused should be ignored for now.

### Automode 
Note Implementation Happens after Automode integration. 

## Auto-mode tests

| # | Test | Setup and steps | Expected | Total check | Result | Notes |
|---|------|-----------------|----------|-------------|--------|-------|
| A1 | Start from zero | Runtime 0:01:00, current 0:00:00. Start, wait 10s | Clock 10s, boxes 0/0/10, time left 50s, bar about 17% | n/a | | |
| A2 | Start from a non-zero time | Runtime 0:01:00, current 0:00:30. Start, wait 10s | Boxes about 0/0/40, time left 20s, bar about 67% | n/a | | |
| A3 | Blank runtime | Runtime empty. Press Start | Alert "Please Input Runtime", clock doesn't start | n/a | | |
| A4 | Pause freezes everything | Runtime 0:05:00. Start, wait 10s, Pause, wait 10s | Clock, boxes, time left and bar all stay put. Paused total unchanged (banked only on Resume) | n/a | | |
| A5 | Resume continues | After A4, Resume, wait 5s | Clock about 15s (not 25s). Paused total about 10s | n/a | | |
| A6 | Stop freezes and keeps totals | Start, wait 10s, Stop | Clock and boxes stop. Totals stay on screen | n/a | | |
| A7 | Past the runtime | Runtime 0:00:30. Start, wait 40s | Time left stays 0, bar stops at 100%, boxes stop at 0:00:30. Clock keeps running until the 7C finish rule | n/a | | Known: 7C |
| A8 | Re-anchor backward | Runtime 0:05:00. Start, wait 20s, type 0:01:00, Calculate | Boxes continue from about 1:00, not 0:20 | n/a | | |
| A9 | Re-anchor forward | Same, but type 0:02:00 | Boxes continue from about 2:00 | n/a | | |
| A10 | Calculate during a pause | Start, Pause, then Calculate | Alert "Resume before calculating". Nothing changes | n/a | | |
| A11 | Start sets the baseline | Reset. Runtime 0:05:00, current 0. Start, wait 20s, type 0:00:20, Calculate | The first Calculate updates the totals: watched 20, distraction about 0, total elapsed about 20 | 20+0+0 = 20 | | |
| A12 | Three buckets at once | Continue the clock from baseline. Over 60s of real time: pause for 20s, resume, then type 0:00:25 and Calculate | Watched 25, distraction 15, paused 20, total elapsed 60 | 25+15+20 = 60 | | |
| A13 | Pause not counted twice | After A12, wait 30s with no pause. Type 0:00:55, Calculate | Watched 55, distraction 15, paused 20, total elapsed 90 | 55+15+20 = 90 | | |
| A14 | Reset while running | Start, wait 5s, Reset, confirm | Clock stops and never updates again. Start enabled, boxes blank, bar 0% | n/a | | |
| A15 | Refresh after Calculate | Calculate once, refresh | Boxes, runtime, time left and bar remain | n/a | | |
| A16 | Refresh while running | Start, wait, refresh | Clock is lost (nothing saved yet) | n/a | | Known: 7C |

## Other checks

| # | Test | Expected result |
|---|------|-----------------|
| 11 | First click only | No watched or distraction change (baseline only) |
| 12 | Run time left blank | Alert: "Please Input Runtime." |
| 13 | Current time later than run time | Alert: "Runtime must be longer than current time." |
| 14 | Equal times on the first click | Alert: "You Skipped to The End of The Video." |
| 15 | Equal times on a later click | Accepted, time left shows 0 |
| 16 | Three clicks in a row | Totals keep growing (stay numbers, never NaN) |
| 17 | Rewind to 0:00| All time to it goes to real time but the remaining time goes to 0 | 
| 18 | New Time Larger than Run Time | Alert: "Runtime must be longer than current time." |

A pause that happens partway through an auto-mode interval, such as 60 real seconds with 20 paused and 25 moved.

## Known issue (parked for future stages)

If the video moves **more** than real time passed (for example, 1:00 to 2:00 after 5 seconds), distraction goes negative (5 - 60 = -55). The invariant still holds, but the result makes no physical sense. The speed/skip prompt in Stage 9 will handle this.

## Results log

| Date | Cases run | Pass/Fail | Notes |
|------|-----------|-----------|-------|
| 2026-11-2 | 1 to 5, 11 to 18| 5/5, 8/8 | Problem is mainly in running the exact IRL time to seconds|