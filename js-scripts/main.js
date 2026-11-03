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
let progressBar; // Moves the Progress Bar
let pausedSinceEntrySecs = 0; // Pause for Manual Mode

// The Storage Keys
let savedWatchTotal = keyPrefix+ "watchedTotalSecs";
let savedDistactTotal = keyPrefix+ "distractionTotalSecs";
let savedElapsedTotal = keyPrefix+ "totalElapsedSecs";
let savedPrevTimeSecs = keyPrefix+ "previousTimeSecs";
let savedPrevTimeStamp = keyPrefix+ "previousTimestampMs";

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

watchedTotalSecs = Number(localStorage.getItem(savedWatchTotal));
distractionTotalSecs = Number(localStorage.getItem(savedDistactTotal));
totalElapsedSecs = Number(localStorage.getItem(savedElapsedTotal));

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
    document.getElementById("automaticClock").textContent = formatTime(timeInterval);
    }, 1000);

}

document.getElementById("calculateTimeDiff").onclick = function(){

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
    alert("Resume before calculating.");
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


    //console.log(realElapsedSecs, timeMovedSecs, watchedTotalSecs, distractionTotalSecs);
    localStorage.setItem(savedWatchTotal,watchedTotalSecs);
    localStorage.setItem(savedDistactTotal, distractionTotalSecs);
    localStorage.setItem(savedElapsedTotal, totalElapsedSecs);
    localStorage.setItem(savedPrevTimeSecs, previousTimeSecs);
    localStorage.setItem(savedPrevTimeStamp, previousTimestampMs);

    localStorage.setItem(savedcurrHrs, document.getElementById("currtimeHrs").value);
    localStorage.setItem(savedcurrMins, document.getElementById("currtimeMins").value);
    localStorage.setItem(savedcurrSecs, document.getElementById("currtimeSecs").value);
    localStorage.setItem(savedrunHrs, document.getElementById("runtimeHrs").value);
    localStorage.setItem(savedrunMins, document.getElementById("runtimeMins").value);
    localStorage.setItem(savedrunSecs, document.getElementById("runtimeSecs").value);

    }

    progressBar = paintDisplays(currtimeTotalSecs, runtimeTotalSecs, realElapsedSecs);
    localStorage.setItem(savedProgress, progressBar);

    if (startTime.disabled){   // the clock is running or paused
    autoStartSecs = currtimeTotalSecs - timeInterval;
}

    previousTimestampMs = Date.now();
    previousTimeSecs = currtimeTotalSecs;
    pausedSinceEntrySecs = 0; 
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

    if (previousTimeSecs === null){   // Start sets the baseline
        previousTimeSecs = toTotalSeconds(
            document.getElementById("currtimeHrs").value,
            document.getElementById("currtimeMins").value,
            document.getElementById("currtimeSecs").value
        );
        previousTimestampMs = Date.now();
        pausedSinceEntrySecs = 0;
        localStorage.setItem(savedPrevTimeSecs, previousTimeSecs);
        localStorage.setItem(savedPrevTimeStamp, previousTimestampMs);
    }

    autoStartSecs = toTotalSeconds(
    document.getElementById("currtimeHrs").value,
    document.getElementById("currtimeMins").value,
    document.getElementById("currtimeSecs").value
    );

    startTimestamp = Date.now();
    console.log(startTimestamp);
    intervalClock();
    startTime.disabled = true;
}

document.getElementById("pauseTime").onclick = function(){
    if (startTimestamp === null){ //Makes sure you're not pausing anything.
    alert("There is nothing to pause. Please click Start.");
    return;
    }
    if (pauseStartedAt === null){
    document.getElementById("pauseTime").textContent = "Resume";
    pauseStartedAt = Date.now(); // Gets the check done.
    clearInterval(intervalCheck);
    console.log(pauseStartedAt);
    console.log(timeInterval);
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
    console.log("Resuming...");
    } 
}


document.getElementById("stopTime").onclick = function(){
    if (startTimestamp === null){ //Makes sure you're not stoping anything.
    alert("There is nothing to stop. Please click start.");
    return;
    }
    document.getElementById("pauseTime").textContent = "Pause";
    console.log(pausedTotalSecs);
    pausedTotalSecs += thisPauseSecs;
    pausedSinceEntrySecs += thisPauseSecs;
    console.log(pausedTotalSecs);
    pausedSoFarSecs = 0;
    timeInterval = null;
    startTimestamp = null;
    pauseStartedAt = null;
    thisPauseSecs = null;
    clearInterval(intervalCheck);
    document.getElementById("pausedTotalDisplay").textContent = formatTime(pausedTotalSecs);
    document.getElementById("automaticClock").textContent = formatTime(timeInterval);
    console.log(timeInterval);
    console.log("Stopping...");
    startTime.disabled = false; // Stop button from being pressed again
}

document.getElementById("resetTracker").onclick = function(){
    if (!confirm("Reset everything?")) {
        return;
    }

    // Job 1: wipe storage (only your keys, never clear())
    localStorage.removeItem(savedWatchTotal);
    localStorage.removeItem(savedDistactTotal);
    localStorage.removeItem(savedElapsedTotal);
    localStorage.removeItem(savedPrevTimeSecs);
    localStorage.removeItem(savedPrevTimeStamp);
    localStorage.removeItem(savedcurrHrs);   // use your exact spelling
    localStorage.removeItem(savedcurrMins);
    localStorage.removeItem(savedcurrSecs);
    localStorage.removeItem(savedrunHrs);
    localStorage.removeItem(savedrunMins);
    localStorage.removeItem(savedrunSecs);
    localStorage.removeItem(savedProgress);

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
    startTime.disabled = false; // Stop button from being pressed again

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

};
