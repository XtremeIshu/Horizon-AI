const promptInput =
  document.getElementById("promptInput");

const askBtn =
  document.getElementById("askBtn");

const responseBox =
  document.getElementById("responseBox");

const quickPromptButtons =
  document.querySelectorAll(
    ".quick-prompts button"
  );

const menuBtn =
  document.getElementById("menuBtn");

const navLinks =
  document.getElementById("navLinks");

const weatherDemoBtn =
  document.getElementById("weatherDemoBtn");

const weatherTime =
  document.getElementById("weatherTime");

const tempValue =
  document.getElementById("tempValue");

const conditionValue =
  document.getElementById("conditionValue");



/* AI DEMO */

function showResponse(prompt) {

  const value =
    prompt.trim();

  if (!value) {

    promptInput.focus();

    return;
  }


  const lower =
    value.toLowerCase();


  let title =
    "HORIZON understood your task";


  let message =
    "This homepage demo is ready. Connect your preferred AI API to return real answers here.";


  if (
    lower.includes("study") ||
    lower.includes("plan")
  ) {

    title =
      "Study mode activated";

    message =
      "A live version could generate a timetable, revision blocks and topic priorities from your request.";
  }


  else if (
    lower.includes("math") ||
    lower.includes("solve") ||
    lower.includes("problem")
  ) {

    title =
      "Problem-solving mode activated";

    message =
      "A live version could send the problem to your AI backend and return a step-by-step explanation.";
  }


  else if (
    lower.includes("code")
  ) {

    title =
      "Developer mode activated";

    message =
      "A live version could explain, debug or improve your code using your connected AI service.";
  }


  else if (
    lower.includes("write") ||
    lower.includes("email")
  ) {

    title =
      "Writing mode activated";

    message =
      "A live version could draft, rewrite or refine the text you describe.";
  }


  else if (
    lower.includes("weather")
  ) {

    title =
      "Weather mode activated";

    message =
      "Connect a weather API to turn this into live location-based weather information.";
  }


  responseBox.innerHTML = `

    <div class="response-icon">
      ✦
    </div>

    <div>

      <strong>
        ${title}
      </strong>

      <p>
        ${message}
      </p>

    </div>

  `;
}


/* ASK BUTTON */

askBtn.addEventListener(
  "click",
  () => {

    showResponse(
      promptInput.value
    );

  }
);


/* CTRL + ENTER */

promptInput.addEventListener(
  "keydown",
  (event) => {

    if (
      (event.ctrlKey ||
       event.metaKey) &&
      event.key === "Enter"
    ) {

      showResponse(
        promptInput.value
      );

    }

  }
);


/* QUICK PROMPTS */

quickPromptButtons.forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        promptInput.value =
          button.dataset.prompt;

        promptInput.focus();

      }
    );

  }
);


/* MOBILE MENU */

menuBtn.addEventListener(
  "click",
  () => {

    const isOpen =
      navLinks.classList.toggle(
        "open"
      );

    menuBtn.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

  }
);


/* CLOSE MOBILE MENU */

navLinks
  .querySelectorAll("a")
  .forEach((link) => {

    link.addEventListener(
      "click",
      () => {

        navLinks.classList.remove(
          "open"
        );

        menuBtn.setAttribute(
          "aria-expanded",
          "false"
        );

      }
    );

  });


/* CLOCK */

function updateClock() {

  const now =
    new Date();

  weatherTime.textContent =
    now.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );
}


updateClock();


setInterval(
  updateClock,
  30000
);


/* WEATHER DEMO */

weatherDemoBtn.addEventListener(
  "click",
  () => {

    const demos = [

      {
        temp: "28°",
        condition: "Clear & bright"
      },

      {
        temp: "25°",
        condition: "Partly cloudy"
      },

      {
        temp: "30°",
        condition: "Sunny skies"
      },

      {
        temp: "23°",
        condition: "Light breeze"
      }

    ];


    const next =
      demos[
        Math.floor(
          Math.random() *
          demos.length
        )
      ];


    tempValue.textContent =
      next.temp;

    conditionValue.textContent =
      next.condition;

  }
);


/* SCROLL ANIMATION */

const observer =
  new IntersectionObserver(
    (entries) => {

      entries.forEach(
        (entry) => {

          if (
            entry.isIntersecting
          ) {

            entry.target.classList.add(
              "visible"
            );

            observer.unobserve(
              entry.target
            );

          }

        }
      );

    },
    {
      threshold: 0.12
    }
  );


document
  .querySelectorAll(".reveal")
  .forEach(
    (element) => {

      observer.observe(
        element
      );

    }
  );