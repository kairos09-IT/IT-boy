const lessons = [
    {
        name: "Home Row Basics",
        text: "asdf jkl; asdf jkl; a sad lad asks dad."
    },
    {
        name: "Left Hand Practice",
        text: "red fed led sad dad read fear dear."
    },
    {
        name: "Right Hand Practice",
        text: "jill likes milk and kids like fish."
    },
    {
        name: "Top Row",
        text: "we type quite well with our fingers."
    },
    {
        name: "Bottom Row",
        text: "zoo mix box civic vex."
    },
    {
        name: "Common Words",
        text: "the quick brown fox jumps over the lazy dog."
    },
    {
        name: "Numbers",
        text: "123 456 789 12345 67890."
    },
    {
        name: "Speed Practice",
        text: "practice makes your typing faster and more accurate."
    }
];

const courses = [
    {
        title: "Beginner Course",
        description: "Learn the keyboard from the beginning and build proper finger placement.",
        start: 0
    },
    {
        title: "Speed Builder",
        description: "Improve your typing speed with increasingly difficult exercises.",
        start: 2
    },
    {
        title: "Accuracy Training",
        description: "Focus on reducing mistakes and developing consistent typing.",
        start: 4
    },
    {
        title: "Numbers & Symbols",
        description: "Practice numbers, punctuation and special characters.",
        start: 6
    }
];

let currentLesson = 0;
let startTime = null;
let timerInterval = null;
let timeLeft = 60;
let targetWpm = 40;

const textDisplay = document.getElementById("textDisplay");
const typingInput = document.getElementById("typingInput");

const wpmElement = document.getElementById("wpm");
const accuracyElement = document.getElementById("accuracy");
const errorsElement = document.getElementById("errors");
const timerElement = document.getElementById("timer");

const lessonName = document.getElementById("lessonName");
const targetWpmElement = document.getElementById("targetWpm");

const result = document.getElementById("result");
const finalWpm = document.getElementById("finalWpm");
const finalAccuracy = document.getElementById("finalAccuracy");

const keyboard = document.getElementById("keyboard");

const keyboardRows = [
    ["1","2","3","4","5","6","7","8","9","0"],
    ["q","w","e","r","t","y","u","i","o","p"],
    ["a","s","d","f","g","h","j","k","l"],
    ["z","x","c","v","b","n","m"]
];

function createKeyboard() {

    keyboard.innerHTML = "";

    keyboardRows.forEach(row => {

        const rowElement = document.createElement("div");
        rowElement.className = "keyboard-row";

        row.forEach(keyValue => {

            const key = document.createElement("div");

            key.className = "key";
            key.dataset.key = keyValue;
            key.textContent = keyValue.toUpperCase();

            rowElement.appendChild(key);
        });

        keyboard.appendChild(rowElement);
    });
}

function loadLesson(index) {

    currentLesson = index;

    const lesson = lessons[currentLesson];

    lessonName.textContent = lesson.name;

    textDisplay.innerHTML = "";

    [...lesson.text].forEach((character, index) => {

        const span = document.createElement("span");

        span.textContent = character;

        if (index === 0) {
            span.classList.add("current");
        }

        textDisplay.appendChild(span);
    });

    typingInput.value = "";

    resetStats();
}

function resetStats() {

    clearInterval(timerInterval);

    startTime = null;

    timeLeft = Number(
        document.getElementById("timeSetting").value
    );

    timerElement.textContent = timeLeft;

    wpmElement.textContent = "0";
    accuracyElement.textContent = "100%";
    errorsElement.textContent = "0";

    result.classList.add("hidden");

    typingInput.disabled = false;
}

function startTimer() {

    if (startTime !== null) return;

    startTime = Date.now();

    timerInterval = setInterval(() => {

        timeLeft--;

        timerElement.textContent = timeLeft;

        calculateStats();

        if (timeLeft <= 0) {
            finishLesson();
        }

    }, 1000);
}

function calculateStats() {

    const typed = typingInput.value;
    const target = lessons[currentLesson].text;

    let correct = 0;
    let errors = 0;

    [...typed].forEach((character, index) => {

        if (character === target[index]) {
            correct++;
        } else {
            errors++;
        }

    });

    const elapsedSeconds = startTime
        ? Math.max((Date.now() - startTime) / 1000, 1)
        : 1;

    const minutes = elapsedSeconds / 60;

    const wpm = Math.round(
        (correct / 5) / minutes
    );

    const accuracy = typed.length
        ? Math.round((correct / typed.length) * 100)
        : 100;

    wpmElement.textContent = Math.max(wpm, 0);
    accuracyElement.textContent = accuracy + "%";
    errorsElement.textContent = errors;

    updateTextDisplay(typed);

    return {
        wpm: Math.max(wpm, 0),
        accuracy,
        errors
    };
}

function updateTextDisplay(typed) {

    const spans = textDisplay.querySelectorAll("span");

    spans.forEach((span, index) => {

        span.classList.remove("correct", "wrong", "current");

        if (index < typed.length) {

            if (typed[index] === span.textContent) {
                span.classList.add("correct");
            } else {
                span.classList.add("wrong");
            }

        }

        if (index === typed.length) {
            span.classList.add("current");
        }

    });

    highlightKeyboard(typed);
}

function highlightKeyboard(typed) {

    document
        .querySelectorAll(".key")
        .forEach(key => key.classList.remove("active"));

    const target = lessons[currentLesson].text;

    const nextCharacter = target[typed.length];

    if (!nextCharacter) return;

    const key = document.querySelector(
        `.key[data-key="${nextCharacter.toLowerCase()}"]`
    );

    if (key) {
        key.classList.add("active");
    }
}

function finishLesson() {

    clearInterval(timerInterval);

    typingInput.disabled = true;

    const stats = calculateStats();

    finalWpm.textContent = stats.wpm;
    finalAccuracy.textContent = stats.accuracy + "%";

    result.classList.remove("hidden");
}

typingInput.addEventListener("input", () => {

    if (!startTime) {
        startTimer();
    }

    const stats = calculateStats();

    const target = lessons[currentLesson].text;

    if (typingInput.value.length >= target.length) {
        finishLesson();
    }

});

document.getElementById("restartBtn").addEventListener("click", () => {
    loadLesson(currentLesson);
    typingInput.focus();
});

document.getElementById("againBtn").addEventListener("click", () => {
    loadLesson(currentLesson);
    typingInput.focus();
});

document.getElementById("nextBtn").addEventListener("click", () => {

    if (currentLesson < lessons.length - 1) {
        loadLesson(currentLesson + 1);
        typingInput.focus();
    }

});

document.getElementById("wpmInput").addEventListener("input", event => {

    let value = Number(event.target.value);

    value = Math.max(10, Math.min(value || 10, 200));

    targetWpm = value;

    targetWpmElement.textContent = value;

});

document.getElementById("timeSetting").addEventListener("change", () => {
    resetStats();
});

document.getElementById("keyboardLayout").addEventListener("change", event => {

    if (event.target.value === "azerty") {

        keyboardRows[1] = ["a","z","e","r","t","y","u","i","o","p"];
        keyboardRows[2] = ["q","s","d","f","g","h","j","k","l","m"];

    } else {

        keyboardRows[1] = ["q","w","e","r","t","y","u","i","o","p"];
        keyboardRows[2] = ["a","s","d","f","g","h","j","k","l"];

    }

    createKeyboard();

});

document.querySelectorAll(".nav-btn").forEach(button => {

    button.addEventListener("click", () => {

        document
            .querySelectorAll(".nav-btn")
            .forEach(btn => btn.classList.remove("active"));

        document
            .querySelectorAll(".page")
            .forEach(page => page.classList.remove("active"));

        button.classList.add("active");

        document
            .getElementById(button.dataset.page)
            .classList.add("active");

    });

});

function createCourses() {

    const courseList = document.getElementById("courseList");

    courses.forEach((course, index) => {

        const card = document.createElement("div");

        card.className = "course";

        card.innerHTML = `
            <h2>${course.title}</h2>
            <p>${course.description}</p>
            <button type="button">
                Start Course
            </button>
        `;

        card.querySelector("button").addEventListener("click", () => {

            loadLesson(course.start);

            document.querySelector('[data-page="practice"]').click();

        });

        courseList.appendChild(card);

    });

}

createKeyboard();
createCourses();
loadLesson(0);