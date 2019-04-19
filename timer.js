"use strict";

(function everything() {
    /* Classes, because they aren't hoisted */

    /**
     * Time represents a length of time with millisecond accuracy. It is used to
     * store the time taken for a solve, and is used to represent the current
     * time elapsed on the timer. 
     */
    class Time {

        /**
         * Constructs a new instance of a Time object.
         * 
         * @param {number} ms the length of this time interval in milliseconds.
         */
        constructor(ms) {
            this._ms = ms;
        }

        get ms() {
            return this._ms;
        }

        /**
         * Formats this Time into an easily readable string. Times less than one
         * minute are formatted as seconds.milliseconds (e.g. 12.345). Times one
         * minute or greater are formatted as minutes:seconds.milliseconds, with
         * single digit minute and second lengths padded with a zero (e.g. 
         * 01:02.345). Regardless of length of time, milliseconds is padded with
         * 0, 1, or 2 zeros up to a length of 3 (e.g. 32.001).
         * 
         * @returns {string} a string representing this time interval. 
         */
        toString() {
            // get values of numbers for parts of timer 
            let minutes = Math.floor(this._ms / 60000);
            let seconds = Math.floor(this._ms / 1000) % 60; // % 60 is for second rollover when > 1 minute
            let ms = Math.floor(this._ms - (minutes * 60000) - (seconds * 1000));
            
            /* build string of timer. */
            let timerString;
            // pad values with zeroes
            ms = ms.toString().padStart(3, '0');
            // When <1 min, exclude minutes 
            if (minutes < 1) {
                timerString = seconds + "." + ms;
            }
            else {
                minutes = minutes.toString().padStart(2, '0');
                seconds = seconds.toString().padStart(2, '0');
                timerString = minutes + ":" + seconds + "." + ms;
            }
            return timerString;
        }
    }

    /**
     * An object representing a timer that keeps track of time and can also be
     * toggled on and off. 
     */
    class Timer {

        /**
         * Creates a new instance of a timer. interval, time, and start are set
         * to undefined. It will be set to not running by default, and the timer
         * update interval will be set to update every 10 ms.
         */
        constructor() {
            // timer update rate in ms
            this.TIMER_UPDATE_INTERVAL = 10;
            // the interval that updates the timer
            this.interval = undefined;
            // current time on the timer
            this.time = undefined;
            // keeps track of whether timer is running; true is ON, false is OFF
            this.running = false;
            // keeps track of when the timer started
            this.start = undefined;
        }

        /**
         * Turns the timer on or off. Does not use JS intervals or timeout for
         * timekeeping; those are not guaranteed to be accurate. Instead uses
         * JS Date().
         * 
         * @returns {time} a Time object representing the duration of this
         * timer, if the call to toggle() turned off the timer. If the timer is
         * turned on by the call to toggle(), this function returns undefined.
         */
        toggle() {
            if (this.running) {
                // turn timer off
                this.running = false;
                clearInterval(this.interval);
                return this.time;
            }
            else {
                // turn timer on
                this.running = true;

                // get current time
                this.start = Date.now();

                // set up interval to change timer text
                let currentInstance = this; // this no longer refers to the current instance within the function()
                this.interval = setInterval(function() {
                    // delta is ms since timer started
                    let delta = Date.now() - currentInstance.start;
                
                    currentInstance.time = new Time(delta);
                    
                    document.getElementById("timertext").innerHTML = currentInstance.time.toString();
                }, this.TIMER_UPDATE_INTERVAL);
                return undefined;
            }
        }
    } 

    /**
     * A class representing a completed solve. Contains a time and an associated
     * scramble with the time.
     */
    class SolveRecord {

        /**
         * Constructs a new instance of a SolveRecord.
         * 
         * @param {Time} time the length of this solve in milliseconds
         * @param {string} scramble 
         */
        constructor(time, scramble) {
            this._time = time;
            this._scramble = scramble;
        }

        /**
         * Get the Time object associated with this SolveRecord.
         * 
         * @returns {Time} the Time object associated with this SolveRecord
         */
        get time() {
            return this._time;
        }

        /**
         * Get the scramble associated with this SolveRecord.
         * 
         * @returns {string} the scramble associated with this SolveRecord
         */
        get scramble() {
            return this._scramble;
        }
    }

    /* Setup and functions and so on */

    let timer = new Timer();
    let solves = [];

    window.onload = function setup() {

        /* Handles spacebar press. */
        document.body.onkeyup = function(event) {
            // handles key presses, checks multiple properties for browser compatibility
            if(event.keyCode === 32 || event.key === 'Spacebar'){
                let time = timer.toggle();
                if (time !== undefined) {
                    let solveRecord = new SolveRecord(time,generateScramble());
                    addSolveRecord(solveRecord);
                }
            }
        };
    }

    /**
     * Adds a given SolveRecord to the history, and updates the page to reflect
     * this in the HTML. This will add the given SolveRecord to the history
     * table, and update the stats associated with the session.
     * 
     * @param {solveRecord} solveRecord the SolveRecord to be added to the solve
     * history.
     */
    function addSolveRecord(solveRecord) {
        solves.push(solveRecord);

        /* Create new row for history table */
        let newRow = document.createElement("tr");
        
        let number = document.createElement("td");
        number.innerHTML = solves.length;

        let newTime = document.createElement("td");
        newTime.innerHTML = solveRecord.time.toString();

        let scramble = document.createElement("td");
        scramble.innerHTML = solveRecord.scramble;

        newRow.appendChild(number);
        newRow.appendChild(newTime);
        newRow.appendChild(scramble);
        /* add row to existing table */
        let table = document.getElementById("historytablebody");

        table.appendChild(newRow);

        updateStats();
    }

    /**
     * Generates a random scramble, between 16-20 moves in length.
     * 
     * Is generated from a random sequence of moves, NOT a random state. Each of
     * the 18 moves (U, D, L, R, F, B, plus their counterclockwise and 2 
     * variants) has an equal chance of being added to the sequence of moves.
     * 
     * @returns {string} a string representing the scramble as a sequence of
     * moves.
     */
    function generateScramble() {
        return "placeholder: U D2 L' R' L2";
    }

    /**
     * Updates the HTML associated with the stat items.
     */
    function updateStats() {
        let sortedSolves = solves.sort(function(a, b) {
            return a.time.ms - b.time.ms;
        });

        let worstTime = sortedSolves[sortedSolves.length - 1].time.ms;
        let bestTime = sortedSolves[0].time.ms; 

        let sum = 0;
        for (let i = 0; i < sortedSolves.length; i++) {
            sum += sortedSolves[i].time.ms;
        }
        let mean = sum / sortedSolves.length;

        let median;
        if (sortedSolves.length % 2 == 1) {
           median = sortedSolves[parseInt(sortedSolves.length / 2)].time.ms;
        }
        else {
            let leftMiddle = sortedSolves[parseInt(sortedSolves.length / 2 - 1)].time.ms;
            let rightMiddle = sortedSolves[parseInt(sortedSolves.length / 2)].time.ms;
            median = (leftMiddle + rightMiddle) / 2;
        }

        document.getElementById("mean").innerHTML = new Time(mean);
        document.getElementById("besttime").innerHTML = new Time(bestTime);
        document.getElementById("median").innerHTML = new Time(median);
        document.getElementById("worsttime").innerHTML = new Time(worstTime);
    }

})();