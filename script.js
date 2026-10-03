const lessons = [
  {
    name: "F and J",
    text: "fff jjj fff jjj fjf jfj"
  },
  {
    name: "D and K",
    text: "ddd kkk ddd kkk dkdk kdkd"
  },
  {
    name: "Home Row",
    text: "asdf jkl; asdf jkl; fj dk"
  },
  {
    name: "Home Row Words",
    text: "sad dad ask fall lad flask"
  },
  {
    name: "Top Row",
    text: "fff red fed were tree free"
  },
  {
    name: "Top Row Words",
    text: "type write quiet power tower"
  },
  {
    name: "Bottom Row",
    text: "z x c v b n m z x c v"
  },
  {
    name: "Bottom Row Words",
    text: "zoo box mix vex maximum"
  },
  {
    name: "Capital Letters",
    text: "The Quick Brown Fox Jumps"
  },
  {
    name: "Numbers",
    text: "123 456 789 12345 67890"
  },
  {
    name: "Punctuation",
    text: "Hello, world! How are you?"
  },
  {
    name: "Speed Training",
    text: "Practice every day to become faster and more accurate."
  }
];

const courses = [
  {
    name: "Beginner",
    description: "Learn the keyboard from the beginning.",
    start: 0,
    end: 4
  },
  {
    name: "Intermediate",
    description: "Build speed across the whole keyboard.",
    start: 5,
    end: 8
  },
  {
    name: "Advanced",
    description: "Train numbers, punctuation and speed.",
    start: 9,
    end: 11
  }
];

const keyboardRows = [
  [
    "1","2","3","4","5","6","7","8","9","0"
  ],
  [
    "q","w","e","r","t","y","u","i","o","p"
  ],
  [
    "a","s","d","f","g","h","j","k","l"
  ],
  [
    "z","x","c","v","b","n","m"
  ]
];

const state = {
  currentLesson: 0,
  startTime: null,
  timer: null,
  timeLeft: 60,
  targetWpm: 40,
  completed: [],
  bestWpm: 0,
  accuracyHistory: []
};

const saved = localStorage.getItem("kairosTypeV2");

if (saved) {
  try {
    const data = JSON.parse(saved);

    state.completed = Array.isArray(data.completed)
      ? data.completed
      : [];

    state.bestWpm = Number(data.bestWpm) || 0;

    state.accuracyHistory =
      Array.isArray(data.accuracyHistory)
        ? data.accuracyHistory
        : [];

  } catch {
    console.log("Starting fresh.");
  }
}

const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".nav-btn");

const textDisplay = document.getElementById("textDisplay");
const typingInput = document.getElementById("typingInput");

const wpmElement = document.getElementById("wpm");
const accuracyElement = document.getElementById("accuracy");
const errorsElement = document.getElementById("errors");
const timerElement = document.getElementById("timer");

const lessonName = document.getElementById("lessonName");
const targetWpmElement = document.getElementById("targetWpm");
const nextKeyText = document.getElementById("nextKeyText");

const result = document.getElementById("result");

const finalWpm = document.getElementById("finalWpm");
const finalAccuracy = document.getElementById("finalAccuracy");
const finalErrors = document.getElementById("finalErrors");

function saveProgress() {

  localStorage.setItem(
    "kairosTypeV2",
    JSON.stringify({
      completed: state.completed,
      bestWpm: state.bestWpm,
      accuracyHistory: state.accuracyHistory
    })
  );
}

function showPage(pageName) {

  pages.forEach(page => {
    page.classList.toggle(
      "active",
      page.id === pageName
    );
  });

  navButtons.forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.page === pageName
    );
  });

  if (pageName === "home") {
    updateDashboard();
  }

  if (pageName === "courses") {
    renderCourses();
  }
}

navButtons.forEach(button => {

  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });

});

document
  .getElementById("continueBtn")
  .addEventListener("click", () => {

    const next = getNextLesson();

    loadLesson(next);

    showPage("practice");

    typingInput.focus();

  });

document
  .getElementById("backCourses")
  .addEventListener("click", () => {

    showPage("courses");

  });

function getNextLesson() {

  for (let i = 0; i < lessons.length; i++) {

    if (!state.completed.includes(i)) {
      return i;
    }

  }

  return lessons.length - 1;
}

function createKeyboard() {

  const keyboard = document.getElementById("keyboard");

  keyboard.innerHTML = "";

  keyboardRows.forEach(row => {

    const rowElement = document.createElement("div");

    rowElement.className = "keyboard-row";

    row.forEach(keyValue => {

      const key = document.createElement("div");

      key.className = "key";

      key.dataset.key = keyValue;

      key.textContent =
        keyValue.toUpperCase();

      rowElement.appendChild(key);

    });

    keyboard.appendChild(rowElement);

  });

  const specialRow =
    document.createElement("div");

  specialRow.className = "keyboard-row";

  const shift = document.createElement("div");
  shift.className = "key wide";
  shift.textContent = "SHIFT";

  const space = document.createElement("div");
  space.className = "key space";
  space.dataset.key = " ";
  space.textContent = "SPACE";

  const enter = document.createElement("div");
  enter.className = "key wide";
  enter.textContent = "ENTER";

  specialRow.appendChild(shift);
  specialRow.appendChild(space);
  specialRow.appendChild(enter);

  keyboard.appendChild(specialRow);
}

function loadLesson(index) {

  if (index < 0 || index >= lessons.length) {
    return;
  }

  state.currentLesson = index;

  clearInterval(state.timer);

  state.startTime = null;

  state.timeLeft =
    Number(document.getElementById("timeSetting").value);

  timerElement.textContent = state.timeLeft;

  const lesson = lessons[index];

  lessonName.textContent = lesson.name;

  textDisplay.innerHTML = "";

  [...lesson.text].forEach((character, i) => {

    const span = document.createElement("span");

    span.textContent = character;

    if (i === 0) {
      span.classList.add("current");
    }

    textDisplay.appendChild(span);

  });

  typingInput.value = "";

  typingInput.disabled = false;

  result.classList.add("hidden");

  wpmElement.textContent = "0";
  accuracyElement.textContent = "100%";
  errorsElement.textContent = "0";

  updateNextKey();

}

function startTimer() {

  if (state.startTime !== null) {
    return;
  }

  state.startTime = Date.now();

  state.timer = setInterval(() => {

    state.timeLeft--;

    timerElement.textContent =
      state.timeLeft;

    calculateStats();

    if (state.timeLeft <= 0) {
      finishLesson();
    }

  }, 1000);

}

function calculateStats() {

  const typed = typingInput.value;

  const target =
    lessons[state.currentLesson].text;

  let correct = 0;
  let errors = 0;

  [...typed].forEach((character, index) => {

    if (character === target[index]) {
      correct++;
    } else {
      errors++;
    }

  });

  let elapsedSeconds = 1;

  if (state.startTime !== null) {

    elapsedSeconds =
      Math.max(
        (Date.now() - state.startTime) / 1000,
        1
      );

  }

  const minutes =
    elapsedSeconds / 60;

  const wpm =
    Math.round(
      (correct / 5) / minutes
    );

  const accuracy =
    typed.length === 0
      ? 100
      : Math.round(
          (correct / typed.length) * 100
        );

  wpmElement.textContent =
    Math.max(wpm, 0);

  accuracyElement.textContent =
    accuracy + "%";

  errorsElement.textContent =
    errors;

  updateTextDisplay(typed);

  return {
    wpm: Math.max(wpm, 0),
    accuracy,
    errors
  };

}

function updateTextDisplay(typed) {

  const spans =
    textDisplay.querySelectorAll("span");

  spans.forEach((span, index) => {

    span.classList.remove(
      "correct",
      "wrong",
      "current"
    );

    if (index < typed.length) {

      if (
        typed[index] ===
        span.textContent
      ) {
        span.classList.add("correct");
      } else {
        span.classList.add("wrong");
      }

    }

    if (index === typed.length) {
      span.classList.add("current");
    }

  });

  updateNextKey();
}

function updateNextKey() {

  const target =
    lessons[state.currentLesson].text;

  const typed =
    typingInput.value;

  const nextCharacter =
    target[typed.length];

  if (!nextCharacter) {

    nextKeyText.textContent =
      "Lesson complete";

    document
      .querySelectorAll(".key")
      .forEach(key =>
        key.classList.remove("active")
      );

    return;
  }

  const display =
    nextCharacter === " "
      ? "SPACE"
      : nextCharacter.toUpperCase();

  nextKeyText.textContent =
    "Next key: " + display;

  document
    .querySelectorAll(".key")
    .forEach(key =>
      key.classList.remove("active")
    );

  const key =
    document.querySelector(
      `.key[data-key="${CSS.escape(
        nextCharacter.toLowerCase()
      )}"]`
    );

  if (key) {
    key.classList.add("active");
  }

}

function finishLesson() {

  clearInterval(state.timer);

  typingInput.disabled = true;

  const stats = calculateStats();

  finalWpm.textContent =
    stats.wpm;

  finalAccuracy.textContent =
    stats.accuracy + "%";

  finalErrors.textContent =
    stats.errors;

  result.classList.remove("hidden");

  if (
    !state.completed.includes(
      state.currentLesson
    )
  ) {

    state.completed.push(
      state.currentLesson
    );

  }

  if (stats.wpm > state.bestWpm) {
    state.bestWpm = stats.wpm;
  }

  state.accuracyHistory.push(
    stats.accuracy
  );

  saveProgress();

  renderCourses();

  updateDashboard();

}

typingInput.addEventListener(
  "input",
  () => {

    if (state.startTime === null) {
      startTimer();
    }

    const stats =
      calculateStats();

    const target =
      lessons[state.currentLesson].text;

    if (
      typingInput.value.length >=
      target.length
    ) {

      finishLesson();

    }

  }
);

document
  .getElementById("restartBtn")
  .addEventListener("click", () => {

    loadLesson(state.currentLesson);

    typingInput.focus();

  });

document
  .getElementById("againBtn")
  .addEventListener("click", () => {

    loadLesson(state.currentLesson);

    typingInput.focus();

  });

document
  .getElementById("nextBtn")
  .addEventListener("click", () => {

    const next =
      state.currentLesson + 1;

    if (next < lessons.length) {

      if (!state.completed.includes(next)) {

        if (
          !state.completed.includes(
            state.currentLesson
          )
        ) {

          return;

        }

      }

      loadLesson(next);

      typingInput.focus();

    }

  });

function renderCourses() {

  const container =
    document.getElementById("courseMap");

  container.innerHTML = "";

  courses.forEach(course => {

    const card =
      document.createElement("div");

    card.className = "course-card";

    const header =
      document.createElement("div");

    header.className =
      "course-header";

    const title =
      document.createElement("h2");

    title.textContent =
      course.name;

    const completedInCourse =
      state.completed.filter(
        lessonIndex =>
          lessonIndex >= course.start &&
          lessonIndex <= course.end
      ).length;

    const count =
      document.createElement("span");

    count.textContent =
      `${completedInCourse}/${course.end - course.start + 1} completed`;

    header.appendChild(title);
    header.appendChild(count);

    card.appendChild(header);

    const list =
      document.createElement("div");

    list.className =
      "lesson-list";

    for (
      let i = course.start;
      i <= course.end;
      i++
    ) {

      const lessonCard =
        document.createElement("div");

      const completed =
        state.completed.includes(i);

      const unlocked =
        i === 0 ||
        state.completed.includes(i - 1);

      lessonCard.className =
        "lesson-card " +
        (completed ? "completed " : "") +
        (unlocked ? "unlocked" : "locked");

      const number =
        document.createElement("div");

      number.className =
        "lesson-number";

      number.textContent =
        `LESSON ${i + 1}`;

      const title =
        document.createElement("h3");

      title.textContent =
        lessons[i].name;

      const status =
        document.createElement("div");

      status.className =
        "lesson-status";

      if (completed) {

        status.textContent =
          "✓ Completed";

      } else if (unlocked) {

        status.textContent =
          "▶ Start lesson";

      } else {

        status.textContent =
          "🔒 Locked";

      }

      lessonCard.appendChild(number);
      lessonCard.appendChild(title);
      lessonCard.appendChild(status);

      if (unlocked) {

        lessonCard.addEventListener(
          "click",
          () => {

            loadLesson(i);

            showPage("practice");

            typingInput.focus();

          }
        );

      }

      list.appendChild(lessonCard);

    }

    card.appendChild(list);

    container.appendChild(card);

  });

}

function updateDashboard() {

  const completed =
    state.completed.length;

  const progress =
    Math.round(
      (completed / lessons.length) * 100
    );

  document.getElementById(
    "completedCount"
  ).textContent = completed;

  document.getElementById(
    "progressPercent"
  ).textContent =
    progress + "%";

  document.getElementById(
    "progressNumber"
  ).textContent =
    progress + "%";

  document.getElementById(
    "bestWpm"
  ).textContent =
    state.bestWpm;

  const average =
    state.accuracyHistory.length
      ? Math.round(
          state.accuracyHistory.reduce(
            (a, b) => a + b,
            0
          ) /
          state.accuracyHistory.length
        )
      : 100;

  document.getElementById(
    "averageAccuracy"
  ).textContent =
    average + "%";

  document.getElementById(
    "progressFill"
  ).style.width =
    progress + "%";

  if (progress === 0) {

    document.getElementById(
      "progressTitle"
    ).textContent =
      "Start your first lesson";

  } else if (progress === 100) {

    document.getElementById(
      "progressTitle"
    ).textContent =
      "Course complete!";

  } else {

    document.getElementById(
      "progressTitle"
    ).textContent =
      `${completed} of ${lessons.length} lessons completed`;

  }

}

document
  .getElementById("wpmInput")
  .addEventListener("input", event => {

    let value =
      Number(event.target.value);

    if (!Number.isFinite(value)) {
      value = 40;
    }

    value =
      Math.max(
        10,
        Math.min(value, 200)
      );

    state.targetWpm = value;

    targetWpmElement.textContent =
      value;

  });

document
  .getElementById("timeSetting")
  .addEventListener("change", () => {

    loadLesson(state.currentLesson);

  });

document
  .getElementById("keyboardLayout")
  .addEventListener("change", event => {

    if (event.target.value === "azerty") {

      keyboardRows[1] =
        ["a","z","e","r","t","y","u","i","o","p"];

      keyboardRows[2] =
        ["q","s","d","f","g","h","j","k","l","m"];

    } else if (
      event.target.value === "qwertz"
    ) {

      keyboardRows[1] =
        ["q","w","e","r","t","z","u","i","o","p"];

      keyboardRows[2] =
        ["a","s","d","f","g","h","j","k","l"];

    } else {

      keyboardRows[1] =
        ["q","w","e","r","t","y","u","i","o","p"];

      keyboardRows[2] =
        ["a","s","d","f","g","h","j","k","l"];

    }

    createKeyboard();

    updateNextKey();

  });

createKeyboard();

renderCourses();

updateDashboard();

loadLesson(0);