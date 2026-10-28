"use strict";

console.log("script loaded");

document.addEventListener("DOMContentLoaded", () => {
	// Initialize the application here.
});

let timeDiff;
let runtimeTotalSecs;
let currtimeTotalSecs;
let hours, minutes, seconds;

    function formatTime (seconds){
        hours = seconds / 3600;
        minutes = (seconds % 3600)/60;
        seconds = (seconds % 3600)%60;
        return Math.floor(hours) + " Hour(s) " + Math.floor(minutes) + " Minute(s) " + Math.floor(seconds) + " Second(s)";
    }

    function toTotalSeconds (hours, minutes, seconds){
        return (hours * 3600) + (minutes * 60) + (seconds * 1);
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

    if (runtimeTotalSecs === 0 ){
    alert("Please Input Runtime.");
    return;
    }

    timeDiff = runtimeTotalSecs - currtimeTotalSecs;
    
    if (timeDiff < 0){
    alert("Runtime must be longer than current time.");
    return;    
    }

    timeDiff = formatTime(timeDiff);

    document.getElementById("resultTimeDiff").textContent = timeDiff;
}