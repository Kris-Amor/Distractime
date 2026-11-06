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

### Manual-mode rows (M1 to M5)

**Setup for every row:** click Reset and confirm. Type a run time of 0:5:0, type the "previous time," and click Calculate. That only saves the baseline. Wait the "real seconds," type the "new time," and click Calculate again.
Timing is by hand, so a pass means within about 2 to 3 seconds.

| # | Test | Previous time | New time | Real seconds | Expected watched | Expected distraction | Expected pause | Total check | Result |
|---|------|---------------|----------|--------------|------------------|----------------------|----------------|-------------|--------|
| M1 | Watched straight through | 1:05 (65) | 1:25 (85) | 20 | 20 | 0 | 0 | 20 + 0 + 0 = 20 | |
| M2 | Distracted partway | 1:05 (65) | 1:35 (95) | 40 | 30 | 10 | 0 | 30 + 10 + 0 = 40 | |
| M3 | Rewind | 1:05 (65) | 0:35 (35) | 50 | 30 | 20 | 0 | 30 + 20 + 0 = 50 | |
| M4 | Same time re-entered | 1:05 (65) | 1:05 (65) | 20 | 0 | 20 | 0 | 0 + 20 + 0 = 20 | |
| M5 | Paused time | 1:05 (65) | 1:05 (65) | 20 | 0 | 0 | 20 | 0 + 0 + 20 = 20 | Shelved: Manual mode has no pause. Covered by A12 and A13. |

Note: Row 5 is still shelved for Manual Mode. Columns for Paused should be ignored for now.


### Auto-mode tests

| # | Test | Setup and steps | Expected | Total check | Notes |
|---|------|-----------------|----------|-------------|-------|
| A1 | Start from zero | Runtime 0:01:00, current 0:00:00. Start, wait 10s | Clock 10s, boxes 0/0/10/0, time left 50s, bar about 17% |  50 seconds left, Total Time is 0s, Real Time is 10, Watched is 0s, Distraction is 0s  | |
| A2 | Start from a non-zero time | Runtime 0:01:00, current 0:00:30. Start, wait 10s | Boxes about 0/0/10/0, time left 20s, bar about 67% | Time Left 20, Real is 10s, Watched is 0s, Paused is 0s. | |
| A3 | Blank runtime | Runtime empty. Press Start | Alert "Please Input Runtime", clock doesn't start | Passed | |
| A4 | Pause freezes everything | Runtime 0:05:00. Start, wait 10s, Pause, wait 10s | Clock, boxes, time left and bar all stay put. Paused total unchanged (banked only on Resume) |Passed | |
| A5 | Resume continues | After A4, Resume, wait 5s | Clock about 15s (not 25s). Paused total about 10s | Passed | |
| A6 | Stop freezes and keeps totals | Start, wait 10s, Stop | Clock display resets, saved totals stay.| Passed | |
| A7 | Past the runtime | Runtime 0:00:30. Start, wait 40s | Time left stays 0, bar stops at 100%, boxes stop at 0:00:30. Clock stops running with an alert. | Passed | |
| A8 | Re-anchor backward | Runtime 0:05:00. Start, wait 20s, type 0:01:00, Calculate | Boxes continue from about 1:00, not 0:20 | Passed | |
| A9 | Re-anchor forward | Same, but type 0:02:00 | Boxes continue from about 2:00 | Passed| |
| A10 | Calculate during a pause | Start, Pause, then Calculate | Alert "Resume before calculating". Nothing changes | Passed | |
| A11 | Start sets the baseline | Reset. Runtime 0:05:00, current 0. Start, wait 20s, type 0:00:20, Calculate | The first Calculate updates the totals: watched 20, distraction about 0, total elapsed about 20 | Total time: 20s, Real Time: 20s, Watched should be 20, Distraction is 2 seconds due to user pause drift| Passed|
| A12 | Three buckets at once | Continue the clock from baseline. Over 60s of real time: pause for 20s, resume, then type 0:00:25 and Calculate | Watched 25, distraction 15, paused 20, total elapsed 60 | 25+15+20 = 60 |“Passed on rerun, within hand-timing drift.” |
| A13 | Pause not counted twice | After A12, wait 30s with no pause. Type 0:00:55, Calculate | Watched 55, distraction 15, paused 20, total elapsed 90 | 55+15+20 = 90 | W“Passed on rerun, within hand-timing drift.”|
| A14 | Reset while running | Start, wait 5s, Reset, confirm | Clock stops and never updates again. Start enabled, boxes blank, bar 0% | Passed | |
| A15 | Refresh after Calculate | Calculate once, refresh | Boxes, runtime, time left and bar remain | Passed| Clock restored after refresh (7C). |

### Auto-mode pause and resume rows

**Setup for every row:** click Reset, confirm, then type the run time and current time the row needs.
Timing is by hand, so a pass means within about 2 to 3 seconds.

| # | Test | Steps | Expected | Result |
|---|------|-------|----------|--------|
| P1 | Pause freezes the clock | Start, wait 5s, Pause, wait 10s | Clock stays at about 5s, label says "Resume" | |
| P2 | Resume continues, not jumps | From P1, click Resume, wait 5s | Clock shows about 10s, not 20s | |
| P3 | Two pauses add up | Start, Pause 5s, Resume, Pause 3s, Resume | Paused total about 8s (it updates on Resume) | |
| P4 | Pause before Start | Click Pause with no Start | Alert: "There is nothing to pause" | |
| P5 | Stop while paused | Start, Pause 10s, Stop | Paused total about 10s, clock clears | |
| P6 | Stop after resume | Start, Pause 10s, Resume, Stop | Paused total about 10s, not 20s | |
| P7 | Calculate during a pause | Start, Pause, click Calculate | Alert: "Resume before calculating" | |
| P8 | Three-bucket check | Start at 0:00, play 5s, pause 10s, resume, play 5s, type 0:0:10, Calculate | Watched about 10, distraction about 0, paused about 10, total about 20 | |
| P9 | Distraction plus pause | Same as P8, but type 0:0:5 | Watched about 5, distraction about 5, paused about 10, total about 20 | |
| P10 | Finish rule | Run time 0:0:10, current blank, Start | Clock stops itself at about 10s, final time stays on screen, alert "Finished!" | |
| P11 | Refresh while running | Start, wait 5s, refresh | Clock continues, Start disabled | |
| P12 | Refresh while paused | Start, Pause, refresh | Label "Resume", clock frozen | |

**Invariant for P8 and P9:** watched + distraction + paused = total elapsed.

### Input normalizing rows

Setup for every row: click Reset first. Then type the values, click Calculate, and read the boxes.
The rows use the run-time boxes unless stated. A run time of 0 gives "Please Input Runtime," but the boxes still normalize first.

| # | Test | Type in (H / M / S) | Expected boxes after Calculate |
|---|------|---------------------|--------------------------------|
| N1 | Minutes roll into hours | 0 / 120 / 0 | 2 / 0 / 0 |
| N2 | Minutes and seconds both overflow | 0 / 90 / 75 | 1 / 31 / 15 |
| N3 | Seconds only | 0 / 0 / 3700 | 1 / 1 / 40 |
| N4 | Blank hours and seconds | blank / 90 / blank | 1 / 30 / 0 |
| N5 | Already clean | 1 / 5 / 9 | 1 / 5 / 9 (unchanged) |
| N6 | All three blank | blank / blank / blank | Stay blank, placeholders show, alert "Please Input Runtime." |
| N7 | Decimal minutes | 0 / 1.5 / 0 | 0 / 1 / 30 |
| N8 | Decimal seconds | 0 / 0 / 59.9 | 0 / 0 / 59 (floored) |
| N9 | Negative total | 0 / -5 / 0 | 0 / 0 / 0 |
| N10 | Negative offset by a positive | 1 / -5 / 0 | 0 / 55 / 0 (the total is 3300, so it is not zeroed) |
| N11 | Current-time group | current 0 / 90 / 0, run time 2 / 0 / 0 | Current becomes 1 / 30 / 0 |
| N12 | Leaving a box (change event) | type 120 in minutes, then click out of the box | 2 / 0 / 0 without clicking Calculate |
| N13 | Start also normalizes | type 0 / 90 / 0 as run time, click Start | Run-time boxes become 1 / 30 / 0 |
| N14 | Saved after normalizing | Do N2, then click Calculate or Start, then refresh | Boxes still show 1 / 31 / 15 | |
| N14b | Not saved by leaving a box | Do N2, leave the box, refresh without Calculate or Start | Boxes show the old saved values | |
| N15 | Does not fight the clock | Start, click into a current-time box while it runs | The box is not overwritten while the cursor is in it |

N10 is a known quirk, not a bug. The function works on the total, so a negative only zeroes out when the whole total is negative. N14 only works when the values are saved via Start, Calculate, or Resume.

### Other checks

| # | Test | Expected result |
|---|------|-----------------|
| O1 | First click only | No watched or distraction change (baseline only) |
| O2 | Run time left blank | Alert: "Please Input Runtime." |
| O3 | Current time later than run time | Alert: "Runtime must be longer than current time." |
| O4 | Equal times on the first click | Alert: "You Skipped to The End of The Video." |
| O5 | Equal times on a later click | Accepted, time left shows 0 |
| O6 | Three clicks in a row | Totals keep growing (stay numbers, never NaN) |
| O7 | Rewind to 0:00| All time to it goes to real time but the remaining time goes to 0 | 
| O8 | New Time Larger than Run Time | Alert: "Runtime must be longer than current time." |

A pause that happens partway through an auto-mode interval, such as 60 real seconds with 20 paused and 25 moved.

## Known issue (parked for future stages)

If the video moves **more** than real time passed (for example, 1:00 to 2:00 after 5 seconds), distraction goes negative (5 - 60 = -55). The invariant still holds, but the result makes no physical sense. The speed/skip prompt in Stage 9 (Next Release) will handle this.

## Results log

| Date | Cases run | Pass/Fail | Notes |
|------|-----------|-----------|-------|
| 2026-11-2 | M1 to M4, O1 to O8| 4/4, 8/8 | Problem is mainly in running the exact IRL time to seconds, Paused was shelved at the time.|
| 2026-11-6 |  O1 to O8, A1 to A15, P1 to P12, N1 to N15| 8/8, 16/16, 12/12, 15/15 | A11 to A13 prone to user error test, N10 subtracts and N14 only works if the values are saved via calculate or start.|