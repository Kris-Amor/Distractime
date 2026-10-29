"use strict";

console.log("script loaded");

document.addEventListener("DOMContentLoaded", () => {
	// Initialize the application here.
});

let timeDiff;
let runtimeTotalSecs;
let currtimeTotalSecs;
let hours, minutes, seconds, ms;
let previousTimeSecs = null, previousTimestampMs = null;
let timeMoved;
let watchedTotalSecs = 0, distractionTotalSecs = 0, totalElapsedSecs = 0;
let progressBar;

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

    document.getElementById("totaltimeTotalDisplay").textContent = formatTime(totalElapsedSecs);
    document.getElementById("realtimeTotalDisplay").textContent = formatTime(realElapsedSecs);
    document.getElementById("watchedTotalDisplay").textContent = formatTime(watchedTotalSecs);
    document.getElementById("distractedTotalDisplay").textContent = formatTime(distractionTotalSecs);

    console.log(realElapsedSecs, timeMovedSecs, watchedTotalSecs, distractionTotalSecs);
    }

    timeDiff = formatTime(timeDiff); //Formats to Hour, Minute, Second

    document.getElementById("resultTimeDiff").textContent = timeDiff;

    progressBar = (currtimeTotalSecs / runtimeTotalSecs)*100;
    console.log(progressBar);

    document.getElementById("progressFill").style.width = "40%"
    progressFill.style.width = progressBar + "%";

    previousTimestampMs = Date.now();
    previousTimeSecs = currtimeTotalSecs;

}


