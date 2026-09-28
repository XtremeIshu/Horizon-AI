"use strict";


/* =========================================================
   DARK / LIGHT THEME
========================================================= */

const themeBtn =
  document.getElementById("themeBtn");

const savedTheme =
  localStorage.getItem(
    "horizon-theme"
  );


if (savedTheme === "light") {

  document.body.classList.add(
    "light-theme"
  );

  themeBtn.textContent =
    "🌙";
}


themeBtn.addEventListener(
  "click",
  () => {

    const light =
      document.body.classList.toggle(
        "light-theme"
      );

    themeBtn.textContent =
      light ? "🌙" : "☀";

    localStorage.setItem(
      "horizon-theme",
      light ? "light" : "dark"
    );

  }
);


/* =========================================================
   MOBILE MENU
========================================================= */

const menuBtn =
  document.getElementById(
    "menuBtn"
  );

const navLinks =
  document.getElementById(
    "navLinks"
  );


menuBtn.addEventListener(
  "click",
  () => {

    const open =
      navLinks.classList.toggle(
        "open"
      );

    menuBtn.textContent =
      open ? "✕" : "☰";

  }
);


/* =========================================================
   CALCULATOR
========================================================= */

const calcDisplay =
  document.getElementById(
    "calcDisplay"
  );


function appendCalc(value) {

  if (
    calcDisplay.value === "Error"
  ) {

    calcDisplay.value =
      "";
  }


  if (
    calcDisplay.value === "0" &&
    /\d|\./.test(value)
  ) {

    calcDisplay.value =
      "";
  }


  calcDisplay.value += value;
}


function clearCalc() {

  calcDisplay.value =
    "0";
}


function deleteCalc() {

  if (
    calcDisplay.value === "Error" ||
    calcDisplay.value.length <= 1
  ) {

    calcDisplay.value =
      "0";

    return;
  }


  calcDisplay.value =
    calcDisplay.value.slice(
      0,
      -1
    );
}


function calculate() {

  try {

    let expression =
      calcDisplay.value
        .replaceAll("×", "*")
        .replaceAll("÷", "/")
        .replace(
          /(\d+(?:\.\d+)?)%/g,
          "($1/100)"
        );


    const result =
      Function(
        `"use strict"; return (${expression})`
      )();


    if (
      !Number.isFinite(result)
    ) {

      throw new Error(
        "Invalid result"
      );
    }


    calcDisplay.value =
      String(
        Math.round(
          result * 1e10
        ) / 1e10
      );

  } catch {

    calcDisplay.value =
      "Error";
  }
}


/* =========================================================
   UNIT CONVERTER
========================================================= */

const converterData = {

  Length: {
    "Meter (m)": 1,
    "Kilometer (km)": 1000,
    "Centimeter (cm)": 0.01,
    "Millimeter (mm)": 0.001,
    "Mile (mi)": 1609.344,
    "Yard (yd)": 0.9144,
    "Foot (ft)": 0.3048,
    "Inch (in)": 0.0254
  },


  Weight: {
    "Kilogram (kg)": 1,
    "Gram (g)": 0.001,
    "Milligram (mg)": 0.000001,
    "Pound (lb)": 0.45359237,
    "Ounce (oz)": 0.028349523125,
    "Stone (st)": 6.35029318
  },


  Temperature: {
    "Celsius (°C)": "temperature",
    "Fahrenheit (°F)": "temperature",
    "Kelvin (K)": "temperature"
  },


  Area: {
    "Square meter (m²)": 1,
    "Square kilometer (km²)": 1000000,
    "Square centimeter (cm²)": 0.0001,
    "Square foot (ft²)": 0.09290304,
    "Square yard (yd²)": 0.83612736,
    "Acre": 4046.8564224,
    "Hectare": 10000
  },


  Volume: {
    "Liter (L)": 1,
    "Milliliter (mL)": 0.001,
    "Cubic meter (m³)": 1000,
    "Gallon (US)": 3.785411784,
    "Quart (US)": 0.946352946,
    "Pint (US)": 0.473176473,
    "Cup (US)": 0.2365882365
  },


  Speed: {
    "Meters/second": 1,
    "Kilometers/hour": 0.2777777778,
    "Miles/hour": 0.44704,
    "Feet/second": 0.3048,
    "Knot": 0.5144444444
  },


  Time: {
    "Second": 1,
    "Minute": 60,
    "Hour": 3600,
    "Day": 86400,
    "Week": 604800
  },


  Data: {
    "Byte": 1,
    "Kilobyte": 1024,
    "Megabyte": 1024 ** 2,
    "Gigabyte": 1024 ** 3,
    "Terabyte": 1024 ** 4
  }

};


const categorySelect =
  document.getElementById(
    "conversionCategory"
  );

const fromUnit =
  document.getElementById(
    "fromUnit"
  );

const toUnit =
  document.getElementById(
    "toUnit"
  );

const convertInput =
  document.getElementById(
    "convertInput"
  );

const conversionResult =
  document.getElementById(
    "conversionResult"
  );

const converterAccuracy =
  document.getElementById(
    "converterAccuracy"
  );

const converterCategoryLabel =
  document.getElementById(
    "converterCategoryLabel"
  );


Object.keys(converterData)
  .forEach(
    category => {

      categorySelect.add(
        new Option(
          category,
          category
        )
      );

    }
  );


function populateConverterUnits() {

  const category =
    categorySelect.value;


  fromUnit.innerHTML =
    "";

  toUnit.innerHTML =
    "";


  Object.keys(
    converterData[category]
  )
    .forEach(
      unit => {

        fromUnit.add(
          new Option(
            unit,
            unit
          )
        );

        toUnit.add(
          new Option(
            unit,
            unit
          )
        );

      }
    );


  if (
    toUnit.options.length > 1
  ) {

    toUnit.selectedIndex =
      1;
  }


  converterCategoryLabel.textContent =
    category;

  conversionResult.textContent =
    "Result will appear here";
}


function temperatureToCelsius(
  value,
  unit
) {

  if (
    unit === "Celsius (°C)"
  ) {

    return value;
  }


  if (
    unit === "Fahrenheit (°F)"
  ) {

    return (
      value - 32
    ) * 5 / 9;
  }


  return (
    value - 273.15
  );
}


function celsiusToTemperature(
  value,
  unit
) {

  if (
    unit === "Celsius (°C)"
  ) {

    return value;
  }


  if (
    unit === "Fahrenheit (°F)"
  ) {

    return (
      value * 9 / 5
    ) + 32;
  }


  return (
    value + 273.15
  );
}


function formatNumber(value) {

  const absolute =
    Math.abs(value);


  if (
    absolute !== 0 &&
    (
      absolute >= 1e8 ||
      absolute < 0.000001
    )
  ) {

    return value.toExponential(6);
  }


  return Number(
    value.toFixed(8)
  ).toString();
}


function convertUnit() {

  const category =
    categorySelect.value;

  const from =
    fromUnit.value;

  const to =
    toUnit.value;

  const value =
    Number(
      convertInput.value
    );


  if (
    !Number.isFinite(value)
  ) {

    conversionResult.textContent =
      "Please enter a valid value.";

    return;
  }


  let result;


  if (
    category ===
    "Temperature"
  ) {

    const celsius =
      temperatureToCelsius(
        value,
        from
      );


    result =
      celsiusToTemperature(
        celsius,
        to
      );

  }

  else {

    const data =
      converterData[category];


    result =
      value *
      data[from] /
      data[to];
  }


  const formatted =
    formatNumber(result);


  conversionResult.textContent =
    `${value} ${from} = ${formatted} ${to}`;


  converterAccuracy.textContent =
    "Up to 8 decimals";
}


categorySelect.addEventListener(
  "change",
  populateConverterUnits
);


fromUnit.addEventListener(
  "change",
  convertUnit
);


toUnit.addEventListener(
  "change",
  convertUnit
);


convertInput.addEventListener(
  "input",
  convertUnit
);


document.getElementById(
  "convertNowBtn"
).addEventListener(
  "click",
  convertUnit
);


/* SWAP */

document.getElementById(
  "swapUnitsBtn"
).addEventListener(
  "click",
  () => {

    const oldFrom =
      fromUnit.value;

    fromUnit.value =
      toUnit.value;

    toUnit.value =
      oldFrom;

    convertUnit();
  }
);


/* QUICK VALUES */

document.querySelectorAll(
  ".quick-convert-row button"
)
.forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        convertInput.value =
          button.dataset.value;

        convertUnit();
      }
    );

  }
);


/* RESET CONVERTER */

document.getElementById(
  "resetConverterBtn"
)
.addEventListener(
  "click",
  () => {

    categorySelect.value =
      "Length";

    populateConverterUnits();

    convertInput.value =
      "";

    converterAccuracy.textContent =
      "Auto";

    conversionResult.textContent =
      "Result will appear here";

  }
);


categorySelect.value =
  "Length";

populateConverterUnits();


/* =========================================================
   TIMER
========================================================= */

let timerInterval =
  null;

let timerSeconds =
  300;


const timerDisplay =
  document.getElementById(
    "timerDisplay"
  );


function getTimerInputSeconds() {

  const minutes =
    Math.max(
      0,
      parseInt(
        document.getElementById(
          "timerMinutes"
        ).value,
        10
      ) || 0
    );


  const seconds =
    Math.min(
      59,
      Math.max(
        0,
        parseInt(
          document.getElementById(
            "timerSeconds"
          ).value,
          10
        ) || 0
      )
    );


  return (
    minutes * 60 +
    seconds
  );
}


function updateTimerDisplay() {

  const minutes =
    Math.floor(
      timerSeconds / 60
    );


  const seconds =
    timerSeconds % 60;


  timerDisplay.textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}


function startTimer() {

  if (
    timerInterval
  ) {

    return;
  }


  if (
    timerSeconds <= 0
  ) {

    timerSeconds =
      getTimerInputSeconds();
  }


  if (
    timerSeconds <= 0
  ) {

    return;
  }


  timerInterval =
    setInterval(
      () => {

        timerSeconds--;

        updateTimerDisplay();


        if (
          timerSeconds <= 0
        ) {

          pauseTimer();

          if (
            "vibrate" in navigator
          ) {

            navigator.vibrate(
              [150, 80, 150]
            );
          }


          alert(
            "HORIZON Timer finished."
          );

        }

      },
      1000
    );
}


function pauseTimer() {

  clearInterval(
    timerInterval
  );

  timerInterval =
    null;
}


function resetTimer() {

  pauseTimer();

  timerSeconds =
    getTimerInputSeconds();

  updateTimerDisplay();
}


document.getElementById(
  "timerMinutes"
).addEventListener(
  "input",
  () => {

    if (
      !timerInterval
    ) {

      timerSeconds =
        getTimerInputSeconds();

      updateTimerDisplay();
    }

  }
);


document.getElementById(
  "timerSeconds"
).addEventListener(
  "input",
  () => {

    if (
      !timerInterval
    ) {

      timerSeconds =
        getTimerInputSeconds();

      updateTimerDisplay();
    }

  }
);


updateTimerDisplay();


/* =========================================================
   STOPWATCH
   HIGH PRECISION MILLISECONDS
========================================================= */

let stopwatchRunning =
  false;

let stopwatchStart =
  0;

let stopwatchElapsed =
  0;

let lastLapTime =
  0;

let stopwatchFrame =
  null;


const stopwatchDisplay =
  document.getElementById(
    "stopwatchDisplay"
  );


const lapDisplay =
  document.getElementById(
    "lapDisplay"
  );


function formatStopwatch(ms) {

  const hours =
    Math.floor(
      ms / 3600000
    );


  const minutes =
    Math.floor(
      (ms % 3600000) /
      60000
    );


  const seconds =
    Math.floor(
      (ms % 60000) /
      1000
    );


  const milliseconds =
    Math.floor(
      ms % 1000
    );


  return (
    `${String(hours).padStart(2, "0")}:` +
    `${String(minutes).padStart(2, "0")}:` +
    `${String(seconds).padStart(2, "0")}.` +
    `${String(milliseconds).padStart(3, "0")}`
  );
}


function updateStopwatch() {

  if (
    !stopwatchRunning
  ) {

    stopwatchDisplay.textContent =
      formatStopwatch(
        stopwatchElapsed
      );

    return;
  }


  stopwatchElapsed =
    performance.now() -
    stopwatchStart;


  stopwatchDisplay.textContent =
    formatStopwatch(
      stopwatchElapsed
    );


  stopwatchFrame =
    requestAnimationFrame(
      updateStopwatch
    );
}


function startStopwatch() {

  if (
    stopwatchRunning
  ) {

    return;
  }


  stopwatchRunning =
    true;


  stopwatchStart =
    performance.now() -
    stopwatchElapsed;


  updateStopwatch();
}


function pauseStopwatch() {

  if (
    !stopwatchRunning
  ) {

    return;
  }


  stopwatchRunning =
    false;


  cancelAnimationFrame(
    stopwatchFrame
  );


  stopwatchElapsed =
    performance.now() -
    stopwatchStart;


  stopwatchDisplay.textContent =
    formatStopwatch(
      stopwatchElapsed
    );
}


function lapStopwatch() {

  if (
    !stopwatchRunning
  ) {

    lapDisplay.textContent =
      "Start the stopwatch first.";

    return;
  }


  const currentElapsed =
    performance.now() -
    stopwatchStart;


  const lap =
    currentElapsed -
    lastLapTime;


  lastLapTime =
    currentElapsed;


  lapDisplay.textContent =
    `Last lap: ${formatStopwatch(lap)}`;
}


function resetStopwatch() {

  stopwatchRunning =
    false;


  cancelAnimationFrame(
    stopwatchFrame
  );


  stopwatchElapsed =
    0;


  lastLapTime =
    0;


  stopwatchDisplay.textContent =
    "00:00:00.000";


  lapDisplay.textContent =
    "Last lap: --";
}


/* =========================================================
   PERCENTAGE
========================================================= */

function calculatePercentage() {

  const percentage =
    Number(
      document.getElementById(
        "percentValue"
      ).value
    );


  const total =
    Number(
      document.getElementById(
        "percentTotal"
      ).value
    );


  const resultBox =
    document.getElementById(
      "percentageResult"
    );


  if (
    !Number.isFinite(
      percentage
    ) ||
    !Number.isFinite(
      total
    )
  ) {

    resultBox.textContent =
      "Please enter both values.";

    return;
  }


  const result =
    (
      percentage *
      total
    ) / 100;


  resultBox.textContent =
    `${percentage}% of ${total} = ${result}`;
}


function resetPercentage() {

  document.getElementById(
    "percentValue"
  ).value =
    "";

  document.getElementById(
    "percentTotal"
  ).value =
    "";

  document.getElementById(
    "percentageResult"
  ).textContent =
    "Result will appear here";
}


/* =========================================================
   NOTES
========================================================= */

const notes =
  document.getElementById(
    "notes"
  );


const notesTitle =
  document.getElementById(
    "notesTitle"
  );


const savedMessage =
  document.getElementById(
    "savedMessage"
  );


notesTitle.value =
  localStorage.getItem(
    "horizon-notes-title"
  ) ||
  "HORIZON Notes";


notes.value =
  localStorage.getItem(
    "horizon-notes"
  ) ||
  "";


/* SAVE */

function saveNotes() {

  localStorage.setItem(
    "horizon-notes-title",
    notesTitle.value
  );


  localStorage.setItem(
    "horizon-notes",
    notes.value
  );


  savedMessage.textContent =
    "✓ Notes saved locally.";


  setTimeout(
    () => {

      savedMessage.textContent =
        "";

    },
    2500
  );
}


/* CLEAR */

function clearNotes() {

  notes.value =
    "";

  savedMessage.textContent =
    "Notes cleared.";


  setTimeout(
    () => {

      savedMessage.textContent =
        "";

    },
    2000
  );
}


/* RESET */

function resetNotes() {

  notesTitle.value =
    "HORIZON Notes";


  notes.value =
    "";


  localStorage.removeItem(
    "horizon-notes-title"
  );


  localStorage.removeItem(
    "horizon-notes"
  );


  savedMessage.textContent =
    "Notes reset.";


  setTimeout(
    () => {

      savedMessage.textContent =
        "";

    },
    2000
  );
}


/* =========================================================
   NOTES → PDF
========================================================= */

function downloadNotesPDF() {

  const {
    jsPDF
  } = window.jspdf || {};


  if (
    !jsPDF
  ) {

    alert(
      "PDF library could not be loaded."
    );

    return;
  }


  const title =
    notesTitle.value.trim() ||
    "HORIZON Notes";


  const content =
    notes.value.trim() ||
    "No notes were entered.";


  const doc =
    new jsPDF({
      unit: "mm",
      format: "a4"
    });


  const pageWidth =
    doc.internal.pageSize.getWidth();


  const pageHeight =
    doc.internal.pageSize.getHeight();


  const margin =
    18;


  /* Header */

  doc.setFillColor(
    3,
    9,
    22
  );


  doc.rect(
    0,
    0,
    pageWidth,
    35,
    "F"
  );


  doc.setTextColor(
    255,
    255,
    255
  );


  doc.setFont(
    "helvetica",
    "bold"
  );


  doc.setFontSize(
    20
  );


  doc.text(
    "HORIZON",
    margin,
    15
  );


  doc.setFont(
    "helvetica",
    "normal"
  );


  doc.setFontSize(
    9
  );


  doc.text(
    "UTILITIES • NOTES",
    margin,
    23
  );


  /* Title */

  doc.setTextColor(
    8,
    127,
    209
  );


  doc.setFont(
    "helvetica",
    "bold"
  );


  doc.setFontSize(
    16
  );


  doc.text(
    title,
    margin,
    48
  );


  /* Date */

  doc.setTextColor(
    100,
    120,
    140
  );


  doc.setFont(
    "helvetica",
    "normal"
  );


  doc.setFontSize(
    8
  );


  doc.text(
    new Date().toLocaleString(),
    margin,
    55
  );


  /* Body */

  doc.setTextColor(
    35,
    50,
    65
  );


  doc.setFontSize(
    11
  );


  const lines =
    doc.splitTextToSize(
      content,
      pageWidth -
      margin * 2
    );


  let y =
    68;


  lines.forEach(
    line => {

      if (
        y >
        pageHeight - 18
      ) {

        doc.addPage();

        y =
          20;
      }


      doc.text(
        line,
        margin,
        y
      );


      y +=
        6;
    }
  );


  /* File name */

  const fileName =
    title
      .replace(
        /[^a-z0-9]+/gi,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      ) ||
    "HORIZON-Notes";


  doc.save(
    `${fileName}.pdf`
  );
}


/* =========================================================
   SCROLL REVEAL
========================================================= */

const observer =
  new IntersectionObserver(
    entries => {

      entries.forEach(
        entry => {

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
      threshold:
        0.12
    }
  );


document
  .querySelectorAll(
    ".reveal"
  )
  .forEach(
    element => {

      observer.observe(
        element
      );

    }
  );