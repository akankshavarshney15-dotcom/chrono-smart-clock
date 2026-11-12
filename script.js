
// =============================================
// CHRONO - SMART CLOCK
// JavaScript Functionality
// =============================================


// =============================================
// 1. PAGE NAVIGATION
// =============================================

const navItems = document.querySelectorAll(".nav-item[data-page]");
const pages = document.querySelectorAll(".page");

const pageTitles = {
    dashboard: "DASHBOARD",
    alarm: "ALARM",
    stopwatch: "STOPWATCH",
    timer: "TIMER",
    worldclock: "WORLD CLOCK"
};

navItems.forEach(button => {

    button.addEventListener("click", () => {

        const pageId = button.dataset.page;

        navItems.forEach(item => item.classList.remove("active"));
        pages.forEach(page => page.classList.remove("active"));

        button.classList.add("active");

        document.getElementById(pageId).classList.add("active");

        document.getElementById("page-name").textContent =
            pageTitles[pageId];

        document.getElementById("welcome-heading").textContent =
            pageId === "dashboard"
                ? "Welcome Back!"
                : pageTitles[pageId].replace("WORLD CLOCK", "World Clock");

    });

});


// =============================================
// 2. DIGITAL AND ANALOG CLOCK
// =============================================

function updateClock() {

    const now = new Date();

    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const ampm = hours >= 12 ? "PM" : "AM";

    const displayHours = hours % 12 || 12;

    const time =
        String(displayHours).padStart(2, "0") + ":" +
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");

    document.getElementById("digital-clock").textContent = time;

    document.getElementById("time-period").textContent = ampm;

    const dateOptions = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    };

    const date = now.toLocaleDateString("en-IN", dateOptions);

    document.getElementById("clock-date").textContent = date;

    document.getElementById("dashboard-date").textContent = date;


    // Analog Clock Calculations

    const hourDegree =
        (now.getHours() % 12) * 30 +
        minutes * 0.5;

    const minuteDegree =
        minutes * 6 + seconds * 0.1;

    const secondDegree = seconds * 6;

    document.getElementById("hour-hand").style.transform =
        `translateX(-50%) rotate(${hourDegree}deg)`;

    document.getElementById("minute-hand").style.transform =
        `translateX(-50%) rotate(${minuteDegree}deg)`;

    document.getElementById("second-hand").style.transform =
        `translateX(-50%) rotate(${secondDegree}deg)`;

}

updateClock();
setInterval(updateClock, 1000);


// =============================================
// 3. ADVANCED ALARM MANAGEMENT WITH TUNES
// =============================================

const alarmForm = document.getElementById("alarm-form");
const alarmInput = document.getElementById("alarm-time");
const alarmLabel = document.getElementById("alarm-label");
const alarmTone = document.getElementById("alarm-tone");
const alarmList = document.getElementById("alarm-list");
const alarmStatus = document.getElementById("alarm-status");

const previewToneBtn = document.getElementById("preview-tone");
const stopAlarmBtn = document.getElementById("stop-alarm");

let alarms = JSON.parse(localStorage.getItem("chronoAlarms")) || [];

let audioContext = null;
let tuneInterval = null;
let isRinging = false;
let previewTimeout = null;


// Initialize audio

async function initializeAudio() {

    const AudioClass =
        window.AudioContext || window.webkitAudioContext;

    if (!AudioClass) {
        alarmStatus.textContent = "Audio is not supported in this browser.";
        return false;
    }

    if (!audioContext) {
        audioContext = new AudioClass();
    }

    if (audioContext.state === "suspended") {
        await audioContext.resume();
    }

    return true;
}


// Original musical note sequences

const alarmTunes = {

    classic: [784, 988, 784, 988, 1175],

    digital: [880, 880, 660, 880, 660],

    melody: [523, 659, 784, 659, 523, 659, 784]

};


// Play selected tune

function playTune(toneName) {

    if (!audioContext) return;

    const notes = alarmTunes[toneName] || alarmTunes.classic;

    const start = audioContext.currentTime;

    notes.forEach((frequency, index) => {

        const oscillator = audioContext.createOscillator();

        const gain = audioContext.createGain();

        const noteStart = start + index * 0.22;

        oscillator.type = "sine";

        oscillator.frequency.setValueAtTime(
            frequency, noteStart
        );

        gain.gain.setValueAtTime(0, noteStart);

        gain.gain.linearRampToValueAtTime(
            0.18, noteStart + 0.03
        );

        gain.gain.setValueAtTime(
            0.18, noteStart + 0.13
        );

        gain.gain.linearRampToValueAtTime(
            0, noteStart + 0.2
        );

        oscillator.connect(gain);

        gain.connect(audioContext.destination);

        oscillator.start(noteStart);

        oscillator.stop(noteStart + 0.21);

    });

}


// Start ringtone loop

function startTuneLoop(toneName) {

    clearInterval(tuneInterval);

    playTune(toneName);

    tuneInterval = setInterval(() => {

        if (isRinging) {
            playTune(toneName);
        }

    }, 2000);

}


// Preview selected tune

previewToneBtn.addEventListener("click", async function () {

    if (isRinging) {
        alarmStatus.textContent = "Stop the active alarm before previewing another tune.";
        return;
    }

    clearTimeout(previewTimeout);

    try {

        const ready = await initializeAudio();

        if (!ready) return;

        previewToneBtn.disabled = true;

        playTune(alarmTone.value);

        alarmStatus.textContent = "Playing tune preview...";

        previewTimeout = setTimeout(() => {

            previewToneBtn.disabled = false;

            alarmStatus.textContent = "Tune preview completed.";

        }, 2200);

    } catch (error) {

        console.error(error);

        alarmStatus.textContent = "Unable to play preview.";

        previewToneBtn.disabled = false;

    }

});


// Save alarms

function saveAlarms() {

    localStorage.setItem(
        "chronoAlarms",
        JSON.stringify(alarms)
    );

}


// Display alarms

function renderAlarms() {

    alarmList.innerHTML = "";

    document.getElementById("alarm-count").textContent =
        alarms.filter(alarm => alarm.enabled).length;

    if (alarms.length === 0) {

        alarmList.innerHTML =
            '<p class="empty-message">No alarms added yet.</p>';

        return;

    }

    alarms.forEach(alarm => {

        const item = document.createElement("div");

        item.className = "alarm-item";

        const details = document.createElement("div");

        const time = document.createElement("h4");

        time.textContent = alarm.time;

        const description = document.createElement("p");

        description.textContent =
            `${alarm.label || "My Alarm"} • ${alarm.enabled ? "Active" : "Disabled"} • ${alarm.tone || "classic"} tune`;

        details.append(time, description);

        const actions = document.createElement("div");

        actions.className = "alarm-actions";

        const toggle = document.createElement("button");

        toggle.className = "small-btn";

        toggle.dataset.action = "toggle";

        toggle.dataset.id = alarm.id;

        toggle.textContent = alarm.enabled ? "Disable" : "Enable";

        const remove = document.createElement("button");

        remove.className = "small-btn delete-btn";

        remove.dataset.action = "delete";

        remove.dataset.id = alarm.id;

        remove.textContent = "Delete";

        actions.append(toggle, remove);

        item.append(details, actions);

        alarmList.appendChild(item);

    });

}


// Add alarm

alarmForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    if (!alarmInput.value) {

        alarmStatus.textContent = "Please select an alarm time.";

        return;

    }

    if (isRinging) {

        alarmStatus.textContent = "Stop the active alarm first.";

        return;

    }
    try {
    await initializeAudio();
} catch (error) {
    console.log("Audio initialization failed:", error);
}

    const newAlarm = {

        id: Date.now(),

        time: alarmInput.value,

        label: alarmLabel.value.trim(),

        tone: alarmTone.value,

        enabled: true,

        lastTriggered: null

    };

    alarms.push(newAlarm);

    saveAlarms();

    renderAlarms();

    alarmStatus.textContent = "Alarm added successfully!";

    alarmForm.reset();

});


// Enable, Disable and Delete

alarmList.addEventListener("click", function (event) {

    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);

    if (button.dataset.action === "delete") {

        alarms = alarms.filter(alarm => alarm.id !== id);

    }

    if (button.dataset.action === "toggle") {

        const alarm = alarms.find(alarm => alarm.id === id);

        if (alarm) {

            alarm.enabled = !alarm.enabled;

        }

    }

    saveAlarms();

    renderAlarms();

});


// Check alarms every second

setInterval(async function () {

    if (isRinging) return;

    const now = new Date();

    const currentTime =
        String(now.getHours()).padStart(2, "0") + ":" +
        String(now.getMinutes()).padStart(2, "0");

    const today = now.toDateString();

    const matchingAlarm = alarms.find(alarm =>
        alarm.enabled &&
        alarm.time === currentTime &&
        alarm.lastTriggered !== today
    );

    if (!matchingAlarm) return;

    matchingAlarm.lastTriggered = today;

    saveAlarms();

    isRinging = true;

    stopAlarmBtn.disabled = false;

    alarmStatus.textContent =
        "🔔 Alarm ringing: " + (matchingAlarm.label || "Time to wake up!");

    renderAlarms();

    try {

        const ready = await initializeAudio();

        if (ready && isRinging) {
            startTuneLoop(matchingAlarm.tone || "classic");
        }

    } catch (error) {

        console.error("Alarm sound error:", error);

        alarmStatus.textContent =
            "Alarm triggered, but audio could not play.";

    }

}, 1000);


// Stop alarm

stopAlarmBtn.addEventListener("click", function () {

    clearInterval(tuneInterval);

    clearTimeout(previewTimeout);

    tuneInterval = null;

    isRinging = false;

    stopAlarmBtn.disabled = true;

    previewToneBtn.disabled = false;

    alarmStatus.textContent = "Alarm stopped.";

});


// Initial display

renderAlarms();


// =============================================
// 4. STOPWATCH WITH LAP FUNCTION
// =============================================

const stopwatchDisplay =
    document.getElementById("stopwatch-display");

const startStopwatch =
    document.getElementById("start-stopwatch");

const pauseStopwatch =
    document.getElementById("pause-stopwatch");

const resetStopwatch =
    document.getElementById("reset-stopwatch");

const lapStopwatch =
    document.getElementById("lap-stopwatch");

const lapList =
    document.getElementById("lap-list");

let stopwatchStart = 0;

let elapsedTime = 0;

let stopwatchInterval = null;

let lapCount = 0;


function formatStopwatch(time) {

    const hours = Math.floor(time / 3600000);

    const minutes = Math.floor((time % 3600000) / 60000);

    const seconds = Math.floor((time % 60000) / 1000);

    const milliseconds = Math.floor((time % 1000) / 10);

    return (
        String(hours).padStart(2, "0") + ":" +
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0") + "." +
        String(milliseconds).padStart(2, "0")
    );

}


function updateStopwatch() {

    const currentTime =
        elapsedTime + (performance.now() - stopwatchStart);

    stopwatchDisplay.textContent =
        formatStopwatch(currentTime);

}


// Start

startStopwatch.addEventListener("click", function () {

    if (stopwatchInterval !== null) return;

    stopwatchStart = performance.now();

    stopwatchInterval = setInterval(updateStopwatch, 10);

    startStopwatch.disabled = true;

    pauseStopwatch.disabled = false;

    lapStopwatch.disabled = false;

});


// Pause

pauseStopwatch.addEventListener("click", function () {

    if (stopwatchInterval === null) return;

    elapsedTime += performance.now() - stopwatchStart;

    clearInterval(stopwatchInterval);

    stopwatchInterval = null;

    updateStopwatch();

    startStopwatch.disabled = false;

    pauseStopwatch.disabled = true;

    lapStopwatch.disabled = true;

});


// Reset

resetStopwatch.addEventListener("click", function () {

    clearInterval(stopwatchInterval);

    stopwatchInterval = null;

    elapsedTime = 0;

    stopwatchStart = 0;

    lapCount = 0;

    stopwatchDisplay.textContent = "00:00:00.00";

    lapList.innerHTML =
        '<p class="empty-message">No lap records yet.</p>';

    startStopwatch.disabled = false;

    pauseStopwatch.disabled = true;

    lapStopwatch.disabled = true;

});


// Lap

lapStopwatch.addEventListener("click", function () {

    if (stopwatchInterval === null) return;

    lapCount++;

    const currentTime =
        elapsedTime + (performance.now() - stopwatchStart);

    const lap = document.createElement("div");

    lap.className = "lap-item";

    lap.innerHTML = `
        <span>Lap ${lapCount}</span>
        <span>${formatStopwatch(currentTime)}</span>
    `;

    if (lapCount === 1) {

        lapList.innerHTML = "";

    }

    lapList.prepend(lap);

});


// =============================================
// 5. COUNTDOWN TIMER
// =============================================

const timerHours = document.getElementById("timer-hours");

const timerMinutes = document.getElementById("timer-minutes");

const timerSeconds = document.getElementById("timer-seconds");

const timerDisplay = document.getElementById("timer-display");

const timerStatus = document.getElementById("timer-status");

const startTimer = document.getElementById("start-timer");

const pauseTimer = document.getElementById("pause-timer");

const resetTimer = document.getElementById("reset-timer");

let timerRemaining = 0;

let timerEndTime = 0;

let timerInterval = null;

let timerRunning = false;


function formatTimer(seconds) {

    const hours = Math.floor(seconds / 3600);

    const minutes = Math.floor((seconds % 3600) / 60);

    const remainingSeconds = seconds % 60;

    return (
        String(hours).padStart(2, "0") + ":" +
        String(minutes).padStart(2, "0") + ":" +
        String(remainingSeconds).padStart(2, "0")
    );

}


function updateTimerDisplay() {

    timerDisplay.textContent = formatTimer(timerRemaining);

}


function finishTimer() {

    clearInterval(timerInterval);

    timerInterval = null;

    timerRunning = false;

    timerRemaining = 0;

    updateTimerDisplay();

    timerStatus.textContent = "⏰ Timer completed!";

    startTimer.disabled = false;

    pauseTimer.disabled = true;

    alert("⏰ Your countdown timer has finished!");

}


// Start Timer

startTimer.addEventListener("click", function () {

    if (timerRunning) return;

    if (timerInterval === null && timerRemaining === 0) {

        const hours = Number(timerHours.value);

        const minutes = Number(timerMinutes.value);

        const seconds = Number(timerSeconds.value);

        if (
            !Number.isInteger(hours) ||
            !Number.isInteger(minutes) ||
            !Number.isInteger(seconds) ||
            hours < 0 || hours > 99 ||
            minutes < 0 || minutes > 59 ||
            seconds < 0 || seconds > 59
        ) {

            timerStatus.textContent = "Please enter valid time values.";

            return;

        }

        timerRemaining =
            hours * 3600 + minutes * 60 + seconds;

        if (timerRemaining <= 0) {

            timerStatus.textContent = "Please enter a duration greater than zero.";

            return;

        }

    }

    timerRunning = true;

    timerEndTime = Date.now() + timerRemaining * 1000;

    timerInterval = setInterval(function () {

        timerRemaining = Math.max(
            0,
            Math.ceil((timerEndTime - Date.now()) / 1000)
        );

        updateTimerDisplay();

        if (timerRemaining <= 0) {

            finishTimer();

        }

    }, 200);

    startTimer.disabled = true;

    pauseTimer.disabled = false;

    timerStatus.textContent = "Timer is running.";

});


// Pause Timer

pauseTimer.addEventListener("click", function () {

    if (!timerRunning) return;

    timerRemaining = Math.max(
        0,
        Math.ceil((timerEndTime - Date.now()) / 1000)
    );

    clearInterval(timerInterval);

    timerInterval = null;

    timerRunning = false;

    updateTimerDisplay();

    startTimer.disabled = false;

    pauseTimer.disabled = true;

    timerStatus.textContent = "Timer paused.";

});


// Reset Timer

resetTimer.addEventListener("click", function () {

    clearInterval(timerInterval);

    timerInterval = null;

    timerRunning = false;

    timerRemaining = 0;

    timerHours.value = 0;

    timerMinutes.value = 5;

    timerSeconds.value = 0;

    timerDisplay.textContent = "00:05:00";

    timerStatus.textContent = "Timer reset.";

    startTimer.disabled = false;

    pauseTimer.disabled = true;

});


// =============================================
// 6. WORLD CLOCK
// =============================================

function updateWorldClocks() {

    const worldTimes = document.querySelectorAll(".world-time");

    worldTimes.forEach(clock => {

        const timezone = clock.dataset.zone;

        const time = new Intl.DateTimeFormat("en-GB", {

            timeZone: timezone,

            hour: "2-digit",

            minute: "2-digit",

            second: "2-digit",

            hour12: false

        }).format(new Date());

        clock.textContent = time;

    });

}

updateWorldClocks();

setInterval(updateWorldClocks, 1000);


// =============================================
// 7. DARK AND LIGHT THEME
// =============================================

const themeToggle = document.getElementById("theme-toggle");

const savedTheme = localStorage.getItem("chronoTheme");

if (savedTheme === "light") {

    document.body.classList.add("light-theme");

    themeToggle.innerHTML = "<span>☾</span> Dark Theme";

}


themeToggle.addEventListener("click", function () {

    document.body.classList.toggle("light-theme");

    const isLight =
        document.body.classList.contains("light-theme");

    localStorage.setItem(
        "chronoTheme",
        isLight ? "light" : "dark"
    );

    themeToggle.innerHTML = isLight
        ? "<span>☾</span> Dark Theme"
        : "<span>☼</span> Change Theme";

});


// =============================================
// 8. APPLICATION START
// =============================================

console.log("Chrono Smart Clock loaded successfully!");

