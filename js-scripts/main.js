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
let watchedTotalSecs = 0, distractionTotalSecs = 0, totalElapsedSecs = 0, sessionElapsedSecs = 0; // Total time for watched, distracted, and real time respectively
let progressBar; // Moves the Progress Bar

// The Storage Keys
let savedWatchTotal = keyPrefix+ "watchedTotalSecs";
let savedDistactTotal = keyPrefix+ "distractionTotalSecs";
let savedElapsedTotal = keyPrefix+ "totalElapsedSecs";
let savedPrevTimeSecs = keyPrefix+ "previousTimeSecs";
let savedPrevTimeStamp = keyPrefix+ "previousTimestampMs";

let savedcurrHrs = keyPrefix+ "currtimeHrs";
let savedcurrMins = keyPrefix+ "currtimeMins";
let savedcurrSecs = keyPrefix+ "currtimeSecs";
let savedrunHrs = keyPrefix+ "runtimeHrs";
let savedrunMins = keyPrefix+ "runtimeMins";
let savedrunSecs = keyPrefix+ "runtimeSecs";
let savedProgress = keyPrefix+ "progressFill"

watchedTotalSecs = Number(localStorage.getItem(savedWatchTotal));
distractionTotalSecs = Number(localStorage.getItem(savedDistactTotal));
totalElapsedSecs = Number(localStorage.getItem(savedElapsedTotal));

// Bad Total Catcher
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

// Reloading Startup
document.getElementById("resultTimeDiff").textContent = formatTime(timeDiff);
document.getElementById("totaltimeTotalDisplay").textContent = formatTime(totalElapsedSecs);
document.getElementById("realtimeTotalDisplay").textContent = formatTime(sessionElapsedSecs);
document.getElementById("watchedTotalDisplay").textContent = formatTime(watchedTotalSecs);
document.getElementById("distractedTotalDisplay").textContent = formatTime(distractionTotalSecs);

//document.getElementById("runtimeHrs").value = "05";

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

    timeDiff = runtimeTotalSecs - currtimeTotalSecs;
    
    if (timeDiff < 0){   //Checks if Runtime is longer than current time
    alert("Runtime must be longer than current time.");
    return;    
    } 

    if (previousTimeSecs === null && timeDiff === 0){
    alert("You Skipped to The End of The Video.");
    return;
    }

    if (previousTimeSecs !== null){
    let realElapsedSecs = (Date.now() - previousTimestampMs) / 1000;
    let timeMovedSecs = Math.abs(currtimeTotalSecs - previousTimeSecs);

    watchedTotalSecs += timeMovedSecs;
    distractionTotalSecs += realElapsedSecs - timeMovedSecs;
    totalElapsedSecs += realElapsedSecs;
    sessionElapsedSecs += realElapsedSecs;

    document.getElementById("totaltimeTotalDisplay").textContent = formatTime(totalElapsedSecs);
    document.getElementById("realtimeTotalDisplay").textContent = formatTime(realElapsedSecs);
    document.getElementById("watchedTotalDisplay").textContent = formatTime(watchedTotalSecs);
    document.getElementById("distractedTotalDisplay").textContent = formatTime(distractionTotalSecs);

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

    timeDiff = formatTime(timeDiff); //Formats to Hour, Minute, Second

    document.getElementById("resultTimeDiff").textContent = timeDiff;

    progressBar = (currtimeTotalSecs / runtimeTotalSecs)*100;

    //document.getElementById("progressFill").style.width = "40%"
    progressFill.style.width = progressBar + "%";
    localStorage.setItem(savedProgress, progressBar);

    previousTimestampMs = Date.now();
    previousTimeSecs = currtimeTotalSecs;
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

    // Job 3: reset the screen
    document.getElementById("resultTimeDiff").textContent = "";
    document.getElementById("totaltimeTotalDisplay").textContent = formatTime(0);
    document.getElementById("realtimeTotalDisplay").textContent = formatTime(0);
    document.getElementById("watchedTotalDisplay").textContent = formatTime(0);
    document.getElementById("distractedTotalDisplay").textContent = formatTime(0);
    document.getElementById("progressFill").style.width = "0%";
    document.getElementById("currtimeHrs").value = "";
    document.getElementById("currtimeMins").value = "";
    document.getElementById("currtimeSecs").value = "";
    document.getElementById("runtimeHrs").value = "";
    document.getElementById("runtimeMins").value = "";
    document.getElementById("runtimeSecs").value = "";

};
