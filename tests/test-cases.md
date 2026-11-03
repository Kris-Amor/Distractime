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
~~| 5 | Paused Time | 1:05 (65) | 1:05 (65) | 20 | 0 | 0 | 20 | 0 + 0 + 20 |~~

Note: Row 5 is still shelved for Manual Mode. Columns for Paused should be ignored for now.

### Automode 
Note Implementation Happens after Automode integration. 

| # | Test | Previous time | New time | Real seconds | Expected watched | Expected distraction | Expected Pause |
|---|------|---------------|----------|--------------|------------------|----------------------|----------------| 
~~| 6 | Watched straight through | 1:05 (65) | 1:25 (85) | 20 | 20 | 0 | 0 |~~
~~| 7 | Distracted partway | 1:05 (65) | 1:35 (95) | 40 | 30 | 10 | 0 |~~
~~| 8 | Rewind | 1:05 (65) | 0:35 (35) | 50 | 30 | 20 | 0 |~~
~~| 9 | Same time re-entered | 1:05 (65) | 1:05 (65) | 20 | 0 | 20 | 0| ~~
~~| 10 | Paused Time | 1:05 (65) | 1:05 (65) | 20 | 0 | 0 | 20 | ~~

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