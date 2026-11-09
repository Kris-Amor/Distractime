"use strict";

console.log("script loaded");

document.addEventListener("DOMContentLoaded", () => {
	// Initialize the application here.
});

const keyPrefix = "savedTracker:";

// The variables
let timeDiff = null; // Difference between the two timestamps
let runtimeTotalSecs; //The total runtime in seconds
let currtimeTotalSecs; // The total current time in seconds 
let hours, minutes, seconds, ms; // Units of time
let previousTimeSecs = null, previousTimestampMs = null; //
let timeMoved; // Real time moved
let watchedTotalSecs = 0; // Total Time for Watched
let distractionTotalSecs = 0; // Total Time Distracted
let totalElapsedSecs = 0;  // Total for real time
let sessionElapsedSecs = 0; // Counts the time for current sessions
let pausedTotalSecs = 0; // Total Paused Time
let realElapsedSecs = 0;  // Real Time Elapsed Seconds
let progressBar = 0; // Moves the Progress Bar
let pausedSinceEntrySecs = 0; // Pause for Manual Mode

// The Storage Keys
let savedWatchTotal = keyPrefix+ "watchedTotalSecs";
let savedDistactTotal = keyPrefix+ "distractionTotalSecs";
let savedElapsedTotal = keyPrefix+ "totalElapsedSecs";
let savedPrevTimeSecs = keyPrefix+ "previousTimeSecs";
let savedPrevTimeStamp = keyPrefix+ "previousTimestampMs";
let savedSeenIntro = keyPrefix + "seenIntro";

// Saves the Time and Progress 
let savedcurrHrs = keyPrefix+ "currtimeHrs";
let savedcurrMins = keyPrefix+ "currtimeMins";
let savedcurrSecs = keyPrefix+ "currtimeSecs";
let savedrunHrs = keyPrefix+ "runtimeHrs";
let savedrunMins = keyPrefix+ "runtimeMins";
let savedrunSecs = keyPrefix+ "runtimeSecs";
let savedProgress = keyPrefix+ "progressFill"

// Automatic Time Calculation
let startTimestamp = null;
let intervalCheck; // Interval counter
let timeInterval = null; // Calculated Interval
let pauseStartedAt = null;
let pausedSoFarSecs = 0, thisPauseSecs = null;
let autoStartSecs = 0;

// Clock keys
let savedStartTimestamp = keyPrefix + "startTimestamp";
let savedAutoStartSecs = keyPrefix + "autoStartSecs";
let savedPausedSoFar = keyPrefix + "pausedSoFarSecs";
let savedPauseStartedAt = keyPrefix + "pauseStartedAt";
let savedPausedTotal = keyPrefix + "pausedTotalSecs";
let savedPausedSinceEntry = keyPrefix + "pausedSinceEntrySecs";

watchedTotalSecs = Number(localStorage.getItem(savedWatchTotal));
distractionTotalSecs = Number(localStorage.getItem(savedDistactTotal));
totalElapsedSecs = Number(localStorage.getItem(savedElapsedTotal));

document.getElementById("infoButton").onclick = function(){
    document.getElementById("infoDialog").showModal();
};

document.getElementById("infoClose").onclick = function(){
    document.getElementById("infoDialog").close();
};

document.getElementById("infoDialog").onclose = function(){
    localStorage.setItem(savedSeenIntro, "yes");
};

if (localStorage.getItem(savedSeenIntro) === null){
    document.getElementById("infoDialog").showModal();
}

// Bad Total Catcher
{
if (!Number.isFinite(watchedTotalSecs)||watchedTotalSecs<0){
    watchedTotalSecs = 0;
}
if (!Number.isFinite(totalElapsedSecs)||totalElapsedSecs<0){
    totalElapsedSecs = 0;
}
if (!Number.isFinite(distractionTotalSecs)){
    distractionTotalSecs = 0;
}

if (localStorage.getItem(savedPrevTimeSecs) !== null){
    previousTimeSecs=Number(localStorage.getItem(savedPrevTimeSecs));
}
if (localStorage.getItem(savedPrevTimeStamp) !== null){
    previousTimestampMs=Number(localStorage.getItem(savedPrevTimeStamp));
}

if(localStorage.getItem(savedPrevTimeSecs) === null || localStorage.getItem(savedPrevTimeStamp) === null ){
    previousTimeSecs = null;
    previousTimestampMs = null;
}
}

// Loader of Progress
{
if (localStorage.getItem(savedcurrHrs) !== null){
    document.getElementById("currtimeHrs").value = localStorage.getItem(savedcurrHrs);
}
if (localStorage.getItem( savedcurrMins) !== null){
    document.getElementById("currtimeMins").value = localStorage.getItem(savedcurrMins);
}
if (localStorage.getItem(savedcurrSecs) !== null){
    document.getElementById("currtimeSecs").value = localStorage.getItem(savedcurrSecs);
}
if (localStorage.getItem(savedrunHrs) !== null){
    document.getElementById("runtimeHrs").value = localStorage.getItem(savedrunHrs);
}
if (localStorage.getItem(savedrunMins) !== null){
    document.getElementById("runtimeMins").value = localStorage.getItem(savedrunMins);
}
if (localStorage.getItem(savedrunSecs) !== null){
    document.getElementById("runtimeSecs").value = localStorage.getItem(savedrunSecs);
}
if (localStorage.getItem(savedProgress) !== null){
    progressBar=Number(localStorage.getItem(savedProgress));
    progressFill.style.width = progressBar + "%";
}
}

// Reloading Startup
{
document.getElementById("resultTimeDiff").textContent = formatTime(timeDiff);
document.getElementById("totaltimeTotalDisplay").textContent = formatTime(totalElapsedSecs);
document.getElementById("realtimeTotalDisplay").textContent = formatTime(sessionElapsedSecs);
document.getElementById("watchedTotalDisplay").textContent = formatTime(watchedTotalSecs);
document.getElementById("distractedTotalDisplay").textContent = formatTime(distractionTotalSecs);
document.getElementById("pausedTotalDisplay").textContent = formatTime(pausedTotalSecs);
}

["currtimeHrs", "currtimeMins", "currtimeSecs"].forEach(function(id){
    document.getElementById(id).onchange = function(){
        normalizeInputs("currtimeHrs", "currtimeMins", "currtimeSecs");
    };
});
["runtimeHrs", "runtimeMins", "runtimeSecs"].forEach(function(id){
    document.getElementById(id).onchange = function(){
        normalizeInputs("runtimeHrs", "runtimeMins", "runtimeSecs");
    };
});

    function formatTime (seconds){
        hours = seconds / 3600;
        minutes = (seconds % 3600)/60;
        seconds = (seconds % 3600)%60;
        return Math.floor(hours) + " Hour(s) " + Math.floor(minutes) + " Minute(s) " + Math.floor(seconds) + " Second(s)";
    }

    function toTotalSeconds (hours, minutes, seconds){
        return (hours * 3600) + (minutes * 60) + (seconds * 1);
    }

    function convertSeconds (ms){
        return Math.floor(ms/1000);
    }

    function fillCurrentInputs(totalSecs){
    let s = Math.floor(totalSecs);
    document.getElementById("currtimeHrs").value = Math.floor(s / 3600);
    document.getElementById("currtimeMins").value = Math.floor((s % 3600) / 60);
    document.getElementById("currtimeSecs").value = s % 60;
    }

    function normalizeInputs(hrsId, minsId, secsId){
    let hrsBox = document.getElementById(hrsId);
    let minsBox = document.getElementById(minsId);
    let secsBox = document.getElementById(secsId);

    // All three blank: leave them alone, so the placeholders stay
    if (hrsBox.value === "" && minsBox.value === "" && secsBox.value === ""){
        return;
    }

    let totalSecs = Math.floor(toTotalSeconds(hrsBox.value, minsBox.value, secsBox.value));
    if (!Number.isFinite(totalSecs) || totalSecs < 0){
        totalSecs = 0;
    }

    hrsBox.value = Math.floor(totalSecs / 3600);
    minsBox.value = Math.floor((totalSecs % 3600) / 60);
    secsBox.value = totalSecs % 60;
}

    function paintDisplays(progressSecs, runtimeSecs, realSecs){
    let timeLeftSecs = Math.max(0, runtimeSecs - progressSecs);
    let pct = 0;
    if (runtimeSecs > 0){
        pct = Math.min(100, (progressSecs / runtimeSecs) * 100);
    }

    document.getElementById("resultTimeDiff").textContent = formatTime(timeLeftSecs);
    document.getElementById("totaltimeTotalDisplay").textContent = formatTime(totalElapsedSecs);
    document.getElementById("realtimeTotalDisplay").textContent = formatTime(realSecs);
    document.getElementById("watchedTotalDisplay").textContent = formatTime(watchedTotalSecs);
    document.getElementById("distractedTotalDisplay").textContent = formatTime(distractionTotalSecs);
    document.getElementById("pausedTotalDisplay").textContent = formatTime(pausedTotalSecs);
    progressFill.style.width = pct + "%";

    return pct;
}

// Load the clock state
{
    // Four numbers: a missing value becomes 0
    autoStartSecs = Number(localStorage.getItem(savedAutoStartSecs));
    pausedSoFarSecs = Number(localStorage.getItem(savedPausedSoFar));
    pausedTotalSecs = Number(localStorage.getItem(savedPausedTotal));
    pausedSinceEntrySecs = Number(localStorage.getItem(savedPausedSinceEntry));

    if (!Number.isFinite(autoStartSecs) || autoStartSecs < 0){ autoStartSecs = 0; }
    if (!Number.isFinite(pausedSoFarSecs) || pausedSoFarSecs < 0){ pausedSoFarSecs = 0; }
    if (!Number.isFinite(pausedTotalSecs) || pausedTotalSecs < 0){ pausedTotalSecs = 0; }
    if (!Number.isFinite(pausedSinceEntrySecs) || pausedSinceEntrySecs < 0){ pausedSinceEntrySecs = 0; }

    // Two that can be null: check BEFORE converting
    let rawStart = localStorage.getItem(savedStartTimestamp);
    let rawPause = localStorage.getItem(savedPauseStartedAt);

    if (rawStart !== null){
        startTimestamp = Number(rawStart);
        if (!Number.isFinite(startTimestamp) || startTimestamp > Date.now()){
            startTimestamp = null;
        }
    }

    if (startTimestamp !== null && rawPause !== null){
        pauseStartedAt = Number(rawPause);
        if (!Number.isFinite(pauseStartedAt) || pauseStartedAt < startTimestamp || pauseStartedAt > Date.now()){
            pauseStartedAt = null;
            startTimestamp = null;      // bad pause data: throw away the whole clock
        }
    }

    // The clock needs the run time, and the boxes are loaded by now
    runtimeTotalSecs = toTotalSeconds(
        document.getElementById("runtimeHrs").value,
        document.getElementById("runtimeMins").value,
        document.getElementById("runtimeSecs").value
    );
    if (runtimeTotalSecs === 0){
        startTimestamp = null;
        pauseStartedAt = null;
    }

    // Restore the right state
    if (startTimestamp !== null){
        startTime.disabled = true;

        if (pauseStartedAt === null){
            intervalClock();                         // it was running
        } else {                                      // it was paused
            document.getElementById("pauseTime").textContent = "Resume";
            timeInterval = convertSeconds(pauseStartedAt - startTimestamp) - pausedSoFarSecs;
            let videoPosSecs = Math.min(runtimeTotalSecs, autoStartSecs + timeInterval);
            paintDisplays(videoPosSecs, runtimeTotalSecs, timeInterval);
            document.getElementById("automaticClock").textContent = formatTime(timeInterval);
        }
    }
}

    function intervalClock (){ 
        intervalCheck = setInterval (function(){
        // runs every time the interval fires
        timeInterval = Date.now() - startTimestamp;
        timeInterval = convertSeconds(timeInterval);
        timeInterval -= pausedSoFarSecs;
        console.log(timeInterval);

        let videoPosSecs = Math.min(runtimeTotalSecs, autoStartSecs + timeInterval);
        paintDisplays(videoPosSecs, runtimeTotalSecs, timeInterval);

        let active = document.activeElement.id;  
            if (active !== "currtimeHrs" && active !== "currtimeMins" && active !== "currtimeSecs"){
                fillCurrentInputs(videoPosSecs);
            }
            if (videoPosSecs >= runtimeTotalSecs){
            stopClock(false);
            alert("Finished!");
            }
        document.getElementById("automaticClock").textContent = formatTime(timeInterval);
        }, 1000);

}

    function stopClock(clearDisplay){
        document.getElementById("pauseTime").textContent = "Pause";

        if (pauseStartedAt !== null){
            let openPauseSecs = convertSeconds(Date.now() - pauseStartedAt);
            pausedTotalSecs += openPauseSecs;
            pausedSinceEntrySecs += openPauseSecs;
        }

        pausedSoFarSecs = 0;
        startTimestamp = null;
        pauseStartedAt = null;
        thisPauseSecs = null;
        clearInterval(intervalCheck);
        document.getElementById("pausedTotalDisplay").textContent = formatTime(pausedTotalSecs);

        if (clearDisplay){
            timeInterval = null;
            document.getElementById("automaticClock").textContent = formatTime(0);
        }

        startTime.disabled = false;
}

    function saveState(){
        // Totals (always numbers, so always safe to save)
        localStorage.setItem(savedWatchTotal, watchedTotalSecs);
        localStorage.setItem(savedDistactTotal, distractionTotalSecs);
        localStorage.setItem(savedElapsedTotal, totalElapsedSecs);

        // Sticky notes: only save if they hold a real value
        if (previousTimeSecs !== null){
            localStorage.setItem(savedPrevTimeSecs, previousTimeSecs);
            localStorage.setItem(savedPrevTimeStamp, previousTimestampMs);
        }

        // Input boxes
        localStorage.setItem(savedcurrHrs, document.getElementById("currtimeHrs").value);
        localStorage.setItem(savedcurrMins, document.getElementById("currtimeMins").value);
        localStorage.setItem(savedcurrSecs, document.getElementById("currtimeSecs").value);
        localStorage.setItem(savedrunHrs, document.getElementById("runtimeHrs").value);
        localStorage.setItem(savedrunMins, document.getElementById("runtimeMins").value);
        localStorage.setItem(savedrunSecs, document.getElementById("runtimeSecs").value);

        // Progress bar
        localStorage.setItem(savedProgress, progressBar);

        // Clock anchors (next step, one key each):
        localStorage.setItem(savedAutoStartSecs, autoStartSecs);
        localStorage.setItem(savedPausedSoFar, pausedSoFarSecs);
        localStorage.setItem(savedPausedTotal, pausedTotalSecs);
        localStorage.setItem(savedPausedSinceEntry, pausedSinceEntrySecs);

        // Clock anchors that can be null: save a value, or remove the key
        if (startTimestamp !== null){
            localStorage.setItem(savedStartTimestamp, startTimestamp);
        } else {
            localStorage.removeItem(savedStartTimestamp);
        }

        if (pauseStartedAt !== null){
            localStorage.setItem(savedPauseStartedAt, pauseStartedAt);
        } else {
            localStorage.removeItem(savedPauseStartedAt);
        }
}

function updateButtons(){
    console.log("updateButtons ran, running =", startTimestamp !== null);
    let running = startTimestamp !== null;
    let paused = pauseStartedAt !== null;

    document.getElementById("startTime").disabled = running;
    document.getElementById("pauseTime").disabled = !running;
    document.getElementById("stopTime").disabled = !running;
    document.getElementById("calculateTimeDiff").disabled = paused;
    document.getElementById("controls").classList.toggle("tracking", running);

}

document.getElementById("calculateTimeDiff").onclick = function(){

    normalizeInputs("currtimeHrs", "currtimeMins", "currtimeSecs");
    normalizeInputs("runtimeHrs", "runtimeMins", "runtimeSecs");

    currtimeTotalSecs = toTotalSeconds(
    document.getElementById("currtimeHrs").value,
    document.getElementById("currtimeMins").value,
    document.getElementById("currtimeSecs").value
    );

    runtimeTotalSecs = toTotalSeconds(
    document.getElementById("runtimeHrs").value,
    document.getElementById("runtimeMins").value, 
    document.getElementById("runtimeSecs").value 
    );

    if (runtimeTotalSecs === 0 ){ //Makes sure runtime is inputted
    alert("Please Input Runtime.");
    return;
    }

    if (pauseStartedAt !== null){
    //alert("Resume before calculating.");
    return;
    }

    timeDiff = runtimeTotalSecs - currtimeTotalSecs;
    
    if (timeDiff < 0){   //Checks if Runtime is longer than current time
    alert("Runtime must be longer than current time.");
    return;    
    } 

    if (previousTimeSecs === null && timeDiff === 0){
    alert("You Skipped to The End of The Video.");
    return;
    }

    let realElapsedSecs = 0;

    if (previousTimeSecs !== null){
        realElapsedSecs = (Date.now() - previousTimestampMs) / 1000;
        let activeSecs = realElapsedSecs - pausedSinceEntrySecs;      
        let timeMovedSecs = Math.abs(currtimeTotalSecs - previousTimeSecs);

    watchedTotalSecs += timeMovedSecs;
    distractionTotalSecs += activeSecs - timeMovedSecs;           
    totalElapsedSecs += realElapsedSecs;
    sessionElapsedSecs += realElapsedSecs;
    }

    progressBar = paintDisplays(currtimeTotalSecs, runtimeTotalSecs, realElapsedSecs);

    if (startTime.disabled){   // the clock is running or paused
        autoStartSecs = currtimeTotalSecs - timeInterval;
    }

    previousTimestampMs = Date.now();
    previousTimeSecs = currtimeTotalSecs;
    pausedSinceEntrySecs = 0;

    saveState();
}

document.getElementById("startTime").onclick = function(){
    runtimeTotalSecs = toTotalSeconds(
        document.getElementById("runtimeHrs").value,
        document.getElementById("runtimeMins").value,
        document.getElementById("runtimeSecs").value
    );
    if (runtimeTotalSecs === 0){
        alert("Please Input Runtime.");
        return;
    }
    
    let startPosSecs = toTotalSeconds(
    document.getElementById("currtimeHrs").value,
    document.getElementById("currtimeMins").value,
    document.getElementById("currtimeSecs").value
    );
    
    if (startPosSecs >= runtimeTotalSecs){
        alert("Current time is already at the end. Change it or press Reset.");
        return;
    }

    previousTimeSecs = startPosSecs;
    previousTimestampMs = Date.now();
    pausedSinceEntrySecs = 0;

    autoStartSecs = toTotalSeconds(
    document.getElementById("currtimeHrs").value,
    document.getElementById("currtimeMins").value,
    document.getElementById("currtimeSecs").value
    );

    startTimestamp = Date.now();
    console.log(startTimestamp);
    intervalClock();
    startTime.disabled = true;
    updateButtons();
    saveState();
}

document.getElementById("pauseTime").onclick = function(){
    if (startTimestamp === null){ //Makes sure you're not pausing anything.
    //alert("There is nothing to pause. Please click Start.");
    return;
    }
    if (pauseStartedAt === null){
    document.getElementById("pauseTime").textContent = "Resume";
    pauseStartedAt = Date.now(); // Gets the check done.
    clearInterval(intervalCheck);
    console.log(pauseStartedAt);
    console.log(timeInterval);
    updateButtons();
    saveState();
    console.log("Pausing...");
    }
    else {
    document.getElementById("pauseTime").textContent = "Pause";
    thisPauseSecs = convertSeconds(Date.now() - pauseStartedAt);
    pausedSoFarSecs += thisPauseSecs;
    pausedTotalSecs += thisPauseSecs;
    pausedSinceEntrySecs += thisPauseSecs;   
    document.getElementById("pausedTotalDisplay").textContent = formatTime(pausedTotalSecs);
    pauseStartedAt = null;
    intervalClock ();
    updateButtons();
    saveState();
    console.log("Resuming...");
    } 
}


document.getElementById("stopTime").onclick = function(){
    if (startTimestamp === null){
        //alert("There is nothing to stop. Please click start.");
        return;
    }
    stopClock(true);
    startTime.disabled = false;
    updateButtons();
    saveState();
    console.log("Stopping...");
}

document.getElementById("resetTracker").onclick = function(){
    if (!confirm("Reset everything?")) {
        return;
    }

    // Job 1: wipe storage 
    localStorage.removeItem(savedWatchTotal);
    localStorage.removeItem(savedDistactTotal);
    localStorage.removeItem(savedElapsedTotal);
    localStorage.removeItem(savedPrevTimeSecs);
    localStorage.removeItem(savedPrevTimeStamp);
    localStorage.removeItem(savedcurrHrs);   
    localStorage.removeItem(savedcurrMins);
    localStorage.removeItem(savedcurrSecs);
    localStorage.removeItem(savedrunHrs);
    localStorage.removeItem(savedrunMins);
    localStorage.removeItem(savedrunSecs);
    localStorage.removeItem(savedProgress);

    localStorage.removeItem(savedStartTimestamp);
    localStorage.removeItem(savedAutoStartSecs);
    localStorage.removeItem(savedPausedSoFar);
    localStorage.removeItem(savedPauseStartedAt);
    localStorage.removeItem(savedPausedTotal);
    localStorage.removeItem(savedPausedSinceEntry);

    // Job 2: reset the live variables
    watchedTotalSecs = 0;
    distractionTotalSecs = 0;
    totalElapsedSecs = 0;
    sessionElapsedSecs = 0;
    previousTimeSecs = null;       // null, not 0, so the first-click check works
    previousTimestampMs = null;
    pausedTotalSecs = 0;
    pausedSoFarSecs = 0;
    timeInterval = null;
    startTimestamp = null;
    pauseStartedAt = null;
    thisPauseSecs = null;
    pausedSinceEntrySecs = 0;
    autoStartSecs = 0
    clearInterval(intervalCheck);

    // Job 3: reset the screen
    document.getElementById("resultTimeDiff").textContent = "";
    document.getElementById("totaltimeTotalDisplay").textContent = formatTime(0);
    document.getElementById("realtimeTotalDisplay").textContent = formatTime(0);
    document.getElementById("watchedTotalDisplay").textContent = formatTime(0);
    document.getElementById("distractedTotalDisplay").textContent = formatTime(0);
    document.getElementById("pausedTotalDisplay").textContent = formatTime(0);
    document.getElementById("progressFill").style.width = "0%";
    document.getElementById("currtimeHrs").value = "";
    document.getElementById("currtimeMins").value = "";
    document.getElementById("currtimeSecs").value = "";
    document.getElementById("runtimeHrs").value = "";
    document.getElementById("runtimeMins").value = "";
    document.getElementById("runtimeSecs").value = "";
    document.getElementById("automaticClock").textContent = formatTime(0);
    document.getElementById("pauseTime").textContent = "Pause";
    updateButtons();
};
