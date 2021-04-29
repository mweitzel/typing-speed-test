import "./style.css";
import textSamples from "./textSamples.js";

document.querySelector("#app").innerHTML = `
    <div id="intructions" class="max-w-lg mx-auto flex flex-col items-center mt-5">
      <h1 class="text-2xl font-semibold mb-2">Cody's Speed Typing test</h1>
      <p>The rules are simple. Type the <span class="text-blue-500">blue</span> word. Then type the <span class="text-blue-500">blue</span> word...</p>
      <p>You get the idea, i'm sure you have done this before.</p> 
      <p><span class="text-xl text-green-500">'Enter'</span> will start the timer.</p>
      <p>then <span class="text-lg text-red-500">'Enter'</span> will stop and reset the timer.</p>
      <p><span class="text-lg text-red-500">'Errors'</span> will result in Net words per min penalties.</p>
      <p>You will get a taste of some classics along the way.</p>
      <p>Turst me you'll enjoy it.</p>  
    </div>
    <div class="max-w-md sm:max-w-xl mx-auto flex my-10 justify-center">
        <div class="w-5/12 h-16 flex justify-end items-center whitespace-nowrap overflow-hidden">
            <h1 id="already-typed-text" class="text-lg sm:text-2xl font-semibold text-gray-500"></h1>
        </div>
        <div class="h-16 mx-3 flex items-center whitespace-nowrap">
            <h1 id="current-word" class="text-3xl font-semibold text-blue-600"></h1>
        </div>
        <div class="w-5/12 h-16 flex items-center whitespace-nowrap overflow-hidden">
            <h1 id="upcoming-text" class="text-lg sm:text-2xl font-semibold"></h1>
        </div>
    </div>
    <div class="hidden sm:flex max-w-xl mx-auto flex-col align-middle items-center mb-4">
      <div id="top-keyboard-row" class="flex mb-1 justify-center"></div>
      <div id="middle-keyboard-row" class="flex mb-1 justify-center"></div>
      <div id="bottom-keyboard-row" class="flex mb-1 justify-center"></div>
      <div id="Space" class="w-72 h-12 rounded-lg border key-body"></div>
    </div>
        <div class="max-w-md sm:max-w-xl mx-auto flex border border-black rounded-lg mb-4">
            <div id="input-display" class="w-2/4 h-12 overflow-hidden whitespace-pre flex items-center justify-end">
                <p id="entered-text" class=""></p>
            </div>
            <div id="inner-display" class="w-2/4 h-12 flex align-middle">
                <input id="text-input" class="w-full" autofocus>
            </div>
        </div>
    </div>
    <div id="stats-container" class="max-w-md sm:max-w-xl h-16 mb-4 mx-auto flex justify-between items-center">
      <div id="grossWPM-container" class="flex flex-col items-center">
          <h2 class="text-lg sm:text-xl font-semibold">Gross WPM</h2>
          <h2 id="grossWPM" class="text-lg sm:text-xl font-semibold">00</h2>
      </div>
      <div id="timer-container" class="flex">
          <h1 id="minutes" class="text-2xl sm:text-3xl mx-1 text-red-300">00</h1>
          <h1 class="text-2xl sm:text-3xl mx-1 text-gray-500">:</h1>
          <h1 id="seconds" class="text-2xl sm:text-3xl mx-1 text-red-300">00</h1>
      </div>
      <div id="netWPM-container" class="flex flex-col items-center">
        <h2 class="text-lg sm:text-xl font-semibold">Net WPM</h2>
        <h2 id="netWPM" class="text-lg sm:text-xl font-semibold">00</h2>
      </div>
    </div>
    <div id="final-summary" class="mb-6 hidden max-w-md mx-auto">
      <h2 id ="gwpm-summary" class="text-md sm:text-xl font-semibold"></h2>
      <h2 id ="nwpm-summary" class="text-md sm:text-xl font-semibold"></h2>
      <h2 id ="total-words-summary" class="text-md sm:text-xl font-semibold"></h2>
      <h2 id ="accuracy-summary" class="text-md sm:text-xl font-semibold"></h2>
    </div>
`;

/****************************************************** Variables and Initilizations *******************************************************************/
// Function generates responsive keyboard display
generateKeyBoard();

// Define variable to control the input and inputValidation field.
const inputField = document.getElementById("text-input");
const previousInputText = document.getElementById("entered-text");

// Define variables to control the top scrolling text windows
const currentWordToType = document.getElementById("current-word");
const upcomingWordsToType = document.getElementById("upcoming-text");
const wordsAlreadyTyped = document.getElementById("already-typed-text");

// Define variables to control the grossWPM and netWPM displays
const displayGrossWPM = document.getElementById("grossWPM");
const displayNetWPM = document.getElementById("netWPM");

// Define variables to control the summary display
const finalSummary = document.getElementById("final-summary");
const grossWPMSummary = document.getElementById("gwpm-summary");
const netWPMSummary = document.getElementById("nwpm-summary");
const totalWordsTypedSummary = document.getElementById("total-words-summary");
const errorSummary = document.getElementById("accuracy-summary");

// Track overall errors, totalTypedChars, and totalTypedWords;
let totalNumberOfErrors = 0;
let totalTypedChars = 0;
let totalTypedWords = 0;
// CharsWithErrors will be used for a netWPM penalty
let totalCharsWithErrors = 0;

// Variables for the operation of the timer.
let startingTime, interval;
let timerRunningBool = false;
let timeElapsed = 0;
let minutesDisplay = document.getElementById("minutes");
let secondsDisplay = document.getElementById("seconds");

// GrossWPM defined globally so it can be used in calculate calculateGrossWordsPerMin() and calculateNetWordsPerMin()
let grossWPM, netWPM;

//Get text from text samples array, and fill the variable currentTextPrompt;
shuffle(textSamples);
let currentTextPrompt = textSamples.pop();
currentTextPrompt = addInNewSample(currentTextPrompt);

/********************************************************* Event Handlers *****************************************************************************/
// Event handler on the user input
inputField.addEventListener("input", handleInput);
// Add event handlers to give the key press affect.
document.addEventListener("keydown", startKeyPress);
document.addEventListener("keyup", stopKeyPress);
// Add another keydown event handler for the timer.
document.addEventListener("keydown", manageTimer);

/************************************ Generate Interactive Keyboard, and Functions for Handling keypress events ****************************************/
function generateKeyBoard() {
  const topRowKeys = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"];
  const middleRowKeys = ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"];
  const bottomRowKeys = ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"];

  generateKeyBoardRow(topRowKeys, "top-keyboard-row");
  generateKeyBoardRow(middleRowKeys, "middle-keyboard-row");
  generateKeyBoardRow(bottomRowKeys, "bottom-keyboard-row");
}
function generateKeyBoardRow(letters, rowToFill) {
  for (let i = 0; i < letters.length; i++) {
    // for each letter we need to create a key body, a key label, and the text for the label
    let keyLabel = document.createElement("h3");
    let keyText = document.createTextNode(letters[i].toLocaleUpperCase());
    let keyBody = document.createElement("div");

    // Then we can give each key an id, and a CSS class to turn it into a key
    switch (letters[i]) {
      case ";":
        keyBody.setAttribute("id", "Semicolon");
        break;
      case "'":
        keyBody.setAttribute("id", "Quote");
        break;
      case ",":
        keyBody.setAttribute("id", "Comma");
        break;
      case ".":
        keyBody.setAttribute("id", "Period");
        break;
      case "/":
        keyBody.setAttribute("id", "Slash");
        break;
      default:
        keyBody.setAttribute("id", `Key${letters[i].toLocaleUpperCase()}`);
        break;
    }
    keyBody.setAttribute("class", "key-body");

    // then we add the text to the label, and place the label on the key body
    keyLabel.appendChild(keyText);
    keyBody.appendChild(keyLabel);

    // after that we insert the keybody into the correct row on the keyboard
    let correctRow = document.getElementById(rowToFill);
    correctRow.append(keyBody);
  }
}
function startKeyPress(e) {
  // function produces visual key down affect by changing class of the key cooresponding to the pressed key
  let pressedKey = document.getElementById(e.code);
  if (!!pressedKey) {
    pressedKey.classList.remove("key-body");
    pressedKey.classList.add("pressed-key");
  }
}
function stopKeyPress(e) {
  // function changes the class back to the defual class that all the keys have.
  let pressedKey = document.getElementById(e.code);
  if (!!pressedKey) {
    pressedKey.classList.remove("pressed-key");
    pressedKey.classList.add("key-body");
  }
}
/********************************************************* Functions for Entry Validation ***********************************************************/
function numberOfErrorsInUserWord(typedWord, expectedWord) {
  //Function returns the numbuer of errors in the typedWord.
  // First check for simple equality. If equal return 0 - No errors
  if (typedWord === expectedWord) return 0;

  // if that doesn't work we will return the levenshteinDistance between the two strings.
  // The levenshteinDistane is the number of changes (substitution, insertion, deletion) that would need
  // to be made to string a, in order to correct it to be string b.
  return levenshteinDistance(typedWord, expectedWord);
}
function levenshteinDistance(typedWord, expectedWord) {
  // if the user didn't type anything the min number of errors that represents is expectedWord.length
  if (typedWord.length == 0) return expectedWord.length;

  var matrix = [];
  // matrix will have expectedWord.length + 1 columns.
  // with each col containing an array with 1 element from 0 to expectedWord.length
  var i;
  for (i = 0; i <= expectedWord.length; i++) {
    matrix[i] = [i];
  }
  // matrix will have typedWord.length + 1 rows.
  // populate the first array with ints from 0 to typedWord.length
  var j;
  for (j = 0; j <= typedWord.length; j++) {
    matrix[0][j] = j;
  }
  /* From here we iterate over the characters of the words comparing them. 
    The easiest way to understand this algo, is remembering that matrix[0][0] = 0. Then when we are looping over 
    the chars of both words if the two characters in cooresponding positions are the same, say the first characters match,
    then matrix[1][1] = matrix[0][0] = 0, meaning that no changes are needed. 
  */
  for (i = 1; i <= expectedWord.length; i++) {
    for (j = 1; j <= typedWord.length; j++) {
      if (expectedWord.charAt(i - 1) == typedWord.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }
  return matrix[expectedWord.length][typedWord.length];
}
/*********************************************************** Timer Control Function *******************************************************************/
function manageTimer(e) {
  if (e.code === "Enter" && !timerRunningBool) {
    startTimer();
  } else if (e.code === "Enter" && timerRunningBool) {
    stopTimer();
    displayFinalSummary();
    resetStats();
  }
}
function startTimer() {
  timerRunningBool = true;
  startingTime = Date.now();
  interval = setInterval(updateDisplay, 1000);
}
function stopTimer() {
  timerRunningBool = false;
  clearInterval(interval);
}
function updateDisplay() {
  timeElapsed = Math.round((Date.now() - startingTime) / 1000);
  let minutesElapsed = Math.floor(timeElapsed / 60).toLocaleString("en-US", {
    minimumIntegerDigits: 2,
  });
  let secondsElapsed = (timeElapsed % 60).toLocaleString("en-US", {
    minimumIntegerDigits: 2,
  });
  minutesDisplay.innerHTML = minutesElapsed;
  secondsDisplay.innerHTML = secondsElapsed;
}
/********************************************************* Handle User Input *********************************************************************/
function handleInput(e) {
  /* when the typist hits space that will trigger the following actions
    1. validate the word that the typist just typed against the currentWordToType.
    2. if the timer is running we need to keep track of the errors and the total chars. 
    3. Add a color coded span to the validated typed word to inputValidation paragraph
    4. clear the input field to prepare for the incoming word
    5. update the currentWordToType, wordsAlreadyTyped, upcomingWordsToType. 
    6. recalculate the grossWordsPerMin and netWordsPerMin. 
  */
  if (e.target.value.slice(-1) === " " && e.target.value.length > 1) {
    let inputText = document.createElement("span");
    inputText.innerHTML = e.target.value;

    // 1. validate the word.
    let justTypedErrors = numberOfErrorsInUserWord(
      e.target.value.trimEnd(),
      currentWordToType.innerHTML
    );

    // 2. Increment Errors, TypedChars, and TypedWords if the timer is running.
    if (timerRunningBool) {
      totalTypedWords += 1;
      totalNumberOfErrors += justTypedErrors;
      totalTypedChars += e.target.value.length;
    }
    if (justTypedErrors) totalCharsWithErrors += e.target.value.length;

    // 3. Color code the span and then appended to previousInputText.
    switch (justTypedErrors) {
      case 0:
        inputText.classList.add("text-green-500", "font-medium");
        break;
      case 1:
        inputText.classList.add("text-red-300", "font-medium");
        break;
      case 2:
        inputText.classList.add("text-red-400", "font-semibold");
        break;
      case 3:
        inputText.classList.add("text-red-500", "font-bold");
        break;
      default:
        inputText.classList.add("text-red-600", "font-extrabold");
        break;
    }
    previousInputText.appendChild(inputText);

    // 4. Clear the input field.
    e.target.value = "";

    // 5. Shift the prompt text over one word
    if (currentTextPrompt[0]) {
      wordsAlreadyTyped.append(currentWordToType.innerHTML + " ");
      currentWordToType.innerHTML = currentTextPrompt.shift();
      upcomingWordsToType.innerHTML = currentTextPrompt.join(" ");
    } else {
      currentTextPrompt = textSamples.pop();
      currentTextPrompt = addInNewSample(currentTextPrompt);
    }

    // 6. Lastly we are going to recalculate grossWPM which will in turn recalculate netWPM on every word submission.
    calculateGrossWordsPerMin();
  }
}
/************************************************* GrossWPM and NetWPM Functions ********************************************************************/
function calculateGrossWordsPerMin() {
  if (!timerRunningBool) return; // If time isn't running leave function

  // assign time elapsed if it has yet to be assigned.
  timeElapsed =
    timeElapsed || Math.round((Date.now() - startingTime) / 1000) / 60;

  // compute and display grossWPM. Then call calculateNetWPM based on GrossWPM
  grossWPM = totalTypedChars / 5 / (timeElapsed / 60);
  displayGrossWPM.innerHTML = Math.round(grossWPM);
  calculateNetWordsPerMin();
}
function calculateNetWordsPerMin() {
  // remove any characters with errors from the WPM calculation.
  netWPM = grossWPM - totalCharsWithErrors / 5 / (timeElapsed / 60);
  displayNetWPM.innerHTML = Math.round(netWPM);
}
/************************************************** Final Summary and Reset **************************************************************************************/
function displayFinalSummary() {
  // First clear set up the text fields.
  grossWPMSummary.innerHTML = "Gross words per minute:   ";
  netWPMSummary.innerHTML = "Net Words Per Minute:   ";
  totalWordsTypedSummary.innerHTML = "Total Number of Words Typed:   ";
  errorSummary.innerHTML = "Errors / Characters Typed:   ";

  // Then append the collected typing statics.
  grossWPMSummary.appendChild(
    document.createTextNode(`${Math.round(grossWPM)} words per min`)
  );
  netWPMSummary.appendChild(
    document.createTextNode(`${displayNetWPM.innerHTML} words per min`)
  );
  totalWordsTypedSummary.appendChild(
    document.createTextNode(`${totalTypedWords} words`)
  );
  errorSummary.appendChild(
    document.createTextNode(`${totalNumberOfErrors} / ${totalTypedChars}`)
  );

  finalSummary.classList.remove("hidden");
}
function resetStats() {
  // Reset timer display and time elapsed
  timeElapsed = 0;
  minutesDisplay.innerHTML = "00";
  secondsDisplay.innerHTML = "00";

  // Reset typing stats
  totalNumberOfErrors = 0;
  totalTypedChars = 0;
  totalTypedWords = 0;
  totalCharsWithErrors = 0;

  // Rest previous INput Text
  previousInputText.innerHTML = "";
  wordsAlreadyTyped.innerHTML = "";
}
/***************************************************** Text Samples  *************************************************************************/
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
function addInNewSample(currentTextPrompt) {
  currentTextPrompt = currentTextPrompt.match(/[^ \s]+/g);
  currentWordToType.innerHTML = "";
  currentWordToType.appendChild(
    document.createTextNode(currentTextPrompt.shift())
  );
  upcomingWordsToType.appendChild(
    document.createTextNode(currentTextPrompt.join(" "))
  );
  return currentTextPrompt;
}
