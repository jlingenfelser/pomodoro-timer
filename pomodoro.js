/** Represents a timer that can count down. */
function CountdownTimer(seconds, tickRate) {
    this.seconds = seconds || (25*60);
    this.tickRate = tickRate || 500; // Milliseconds
    this.tickFunctions = [];
    this.isRunning = false;
    this.remaining = this.seconds;

    /** CountdownTimer starts ticking down and executes all tick
        functions once per tick. */
    this.start = function() {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;
        
        // Set variables related to when this timer started
        var startTime = Date.now(), 
            thisTimer = this;
         
        // Tick until complete or interrupted
        (function tick() {
            secondsSinceStart = ((Date.now() - startTime) / 1000) | 0;
            var secondsRemaining = thisTimer.remaining - secondsSinceStart;
            
            // Check if timer has been paused by user
            if (thisTimer.isRunning === false) {
                thisTimer.remaining = secondsRemaining;
            } else {
                if (secondsRemaining > 0) {
                    // Execute another tick in tickRate milliseconds
                    setTimeout(tick, thisTimer.tickRate);
                } else {
                    // Stop this timer
                    thisTimer.remaining = 0;
                    thisTimer.isRunning = false;

                    // Alert user that time is up
                }
                
                var timeRemaining = parseSeconds(secondsRemaining);
                
                // Execute each tickFunction in the list with thisTimer
                // as an argument
                thisTimer.tickFunctions.forEach(
                    function(tickFunction) {
                        tickFunction.call(this, 
                                          timeRemaining.minutes, 
                                          timeRemaining.seconds);
                    }, 
                    thisTimer);
            }
        }());        
    };

    /** Pause the timer. */
    this.pause = function() {
        this.isRunning = false;
    };

    /** Pause the timer and reset to its original time. */
    this.reset = function(seconds) {
        this.isRunning = false;
        this.seconds = seconds
        this.remaining = seconds
    };

    /** Add a function to the timer's tickFunctions. */
    this.onTick = function(tickFunction) {
        if (typeof tickFunction === 'function') {
            this.tickFunctions.push(tickFunction);
        }
    };
}

/** Return minutes and seconds from seconds. */
function parseSeconds(seconds) {
    return {
        'minutes': (seconds / 60) | 0,
        'seconds': (seconds % 60) | 0
    }
}

/*Function to take input in seconds and output HH:MM:SS
@input_secs = integer value in seconds
@output_b = array of [hours, minutes, seconds]
*/
function secondsToHMS(secs){
    var hours = Math.floor(secs / (60*60));

    var leftoverMinutes = secs % (60*60);
    var minutes = Math.floor(leftoverMinutes / 60);

    var leftoverSeconds = secs % 60;
    var seconds = Math.ceil(leftoverSeconds);

    var obj = {
        "h": hours,
        "m": minutes,
        "s": seconds
    };

    var timeString = "";
    var cleanS = "0" + obj.s;
    var cleanM = obj.m;
    if(obj.h > 0 && obj.m < 10){
        var cleanM = "0" + obj.m;
    }

    if(obj.h <= 0){
        if (obj.s < 10){
            timeString += obj.m + ":" + cleanS;
        }
        else{
            timeString += obj.m + ":" + obj.s;
        }
    }
    else{
        if (obj.s < 10){
            timeString += obj.h + ":" + obj.m + ":" + cleanS;
        }
        else {
            timeString += obj.h + ":" + obj.m + ":" + obj.s;
        }
    }
    return timeString;
};




/** Window onload functions. */
window.onload = function () {
    var timerDisplay = document.getElementById('timer'),
        customTimeInput = document.getElementById('custom'),
        timer = new CountdownTimer(),
        timeObj = parseSeconds(25*60);
    
    /** Set the time on the main clock display and
        set the time remaining section in the title. */
    function setTimeOnAllDisplays(minutes, seconds) {
        if (minutes >= 60) {
            // Add an hours section to all displays
            hours = Math.floor(minutes / 60);
            minutes = minutes % 60;
            clockHours = hours + ':';
            document.title = '(' + hours + 'h' + minutes + 'm) Pomodoro';
        } else {
            clockHours = '';
            document.title = '(' + minutes + 'm) Pomodoro';
        }
        
        clockMinutes = minutes < 10 ? '0' + minutes : minutes;
        clockMinutes += ':';
        clockSeconds = seconds < 10 ? '0' + seconds : seconds;

        timerDisplay.textContent = clockHours + clockMinutes + clockSeconds;
    }
    
    /** Delete the old timer
        object, and start a new one. */
    function resetMainTimer(seconds) {
        timer.pause();
        timer = new CountdownTimer(seconds); 
        timer.onTick(setTimeOnAllDisplays);
    }
    
    // Set default page timer displays
    setTimeOnAllDisplays(timeObj.minutes, timeObj.seconds);

    timer.onTick(setTimeOnAllDisplays);

    //Listeners for Start, pause, etc. Buttons
    document.getElementById('start').addEventListener(
        'click', function(){
            timer.start();
        }
    );

    document.getElementById('pause').addEventListener(
        'click', function(){
            timer.pause();
        }
    );


    document.getElementById('reset').addEventListener(
        'click', function(){
            resetMainTimer(timer.seconds);
            timer.start();
        }
    );

    document.getElementById('pomodoro').addEventListener(
        'click', function(){
            resetMainTimer(25*60);
            timer.start();
        }
    );

    document.getElementById('short_break').addEventListener(
        'click', function(){
            resetMainTimer(300);
            timer.start();
        }
    );

    document.getElementById('long_break').addEventListener(
        'click', function(){
            resetMainTimer(15*60);
            timer.start();
        }
    );

    document.getElementById('set').addEventListener(
        'click', function(){
            customUnits = document.getElementById('custom-units').value;
            if (customUnits === 'minutes'){
                resetMainTimer(60*customTimeInput.value);
            }
            else if(customUnits === 'hours'){
                resetMainTimer(3600*customTimeInput.value);
            }
            else{
                resetMainTimer(customTimeInput.value);
            }
            timer.start();
        }
    );
};