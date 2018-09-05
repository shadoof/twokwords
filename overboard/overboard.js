// overboard, by John Cayley
// web version released May 2018
/* globals RiText,Hammer */
// configuration
var VERSION = "0.2.3"; // eslinted
var withAudio = true, paused = true, firstGasp = true; // playCount = 0
var TITLES_FX_SECS = .05, SUFLOSI_FX_SECS = 1.25;
var fxSeconds = TITLES_FX_SECS;
var PRODUCTION = true;
var IVORY_ON_BLACK = true;
var BLACK = [0, 0, 0, 255];
var IVORY = [255, 255, 240, 255];
var FILL, BACKGROUND;
// constants
var FLOATING = 0, SURFACING = 1, SINKING = 2;
var BUOYANCY_STRINGS = ["floating","surfacing","sinking"];
// var NO_SPACES = false, NO_APOSTROPHE = false;
var SPC = " ", SPC_NUM = 0;
var ABC = " abcdefghijklmnopqrstuvwxyz";
var WIDTH = 1280, HEIGHT = 720;
var TEXT_X = 700, TEXT_Y = 80, IMG_X = 140, lineY;
var FONT_SIZE = 20, LEADING = FONT_SIZE + Math.ceil(FONT_SIZE / 3);
// the following is from noth'rs (as used for riverIsland, etc.
// NOT used for transliteral drifting)
// var ALPHA_LOOP = " eaiouüy’lrwvjghkcxzqbpfsmndt";
// attempt to rearrange this with respect to subliteral differences:
// var ALPHA_LOOP = "jiaeocuyvwmnhrlftkxszgqbpd";
var DEFAULT_LANGUAGE = "en";
// NOT used in overboard
// var origin = "", destination = "";
// var mesosticConstraint = false;
//
// general
var promises = [], captions = [];
var standingOrder = "running", phase = 0;
var keyLock = false, showStatusUntil = 0;
var monoFont;
// NOT used in overboard
// var titleFont,serifFont,captionFont;
var titles = [];
var passages = [];
var titlePassage;
var texts, modelTexts, literalAlts;
var imageWidth, imageHeight;
var waveImages = [], cursorImages = [];
// this structure is simply reproducing what was
// coded in the original QuickTime version of overboard
var states = [
  {state:[1, 1, 1, 1], seconds:36},
  {state:[1, 1, 1, 0], seconds:27},
  {state:[0, 1, 1, 1], seconds:27},
  {state:[1, 1, 0, 0], seconds:18},
  {state:[0, 0, 1, 1], seconds:18},
  {state:[1, 0, 0, 0], seconds:9},
  {state:[0, 0, 0, 1], seconds:9},
  {state:[0, 0, 0, 0], seconds:9}
];
var prevStates = [1, 1, 1, 1];
var statusCaption;
var statusCaptions = [
  "Opening sequence to titles",
  "Titles",
  "Titles closing transition",
  "Passages surfacing",
  "Ambient state ‘suflosi’",
  "Passages sinking to close",
  "overboard quit"
];
var scIndex = 0;
// audio-related
var SEMITONE_RATIO = Math.pow(2, 1/12);
var audioContext, compressor;
var audioCursors = [];
var bell, rolls,letternotes, BASE_NOTE = 60;
var sounds = [];
var breathin = true, lastBreath = 0, BREATH = 5000;
var playCount = 0;
// gestures
var gestures, canvas;

// ----- P5 FUNCTIONS -----
function preload() {
  // ---- FONTS ----
  // titleFont = loadFont('../fonts/TrajanPro-Regular.otf');
  // mono possible: DejaVuSansMono, Consolas, AndaleMono, PrestigeEliteStd-Bd.otf
  monoFont = loadFont("../fonts/Monaco.ttf");
  // serif possible: iowansrm, Constantia, DejaVuSerif, Cambria, Perpetua
  // serifFont = loadFont('../fonts/iowaosrm.ttf')
  // captionFont = loadFont('../fonts/Monaco.ttf');
  // arsFont = loadFont('../fonts/Perpetua.ttf');
  // arsItalic = loadFont('../fonts/PerpetuaItalic.ttf');
  // ---- TEXT & TEXT VARIABLES ----
  literalAlts = loadStrings("literalalts.json");
  texts = loadStrings("overboardtexts.json");
  // ---- IMAGES ----
  for (var i = 0; i < 27; i++) {
    let fn = (i < 10) ? "w0" + i : "w" + i;
    let newImage = loadImage("obimages/" + fn + ".png");
    let newCursor = loadImage("abimages/" + fn + ".png");
    waveImages.push(newImage);  
    cursorImages.push(newCursor);  
  }
  // ----- AUDIO -----
  bell = loadSound("obaudio/underwaterBellStereo.mp3");
  sounds.push(bell);
  rolls = loadSound("obaudio/surdoRollsStereo.mp3");
  sounds.push(rolls);
  letternotes = loadStrings("letternotes.json");
  audioContext = getAudioContext();
}

function setup() {

  info("overboard version " + VERSION);
  createCanvas(WIDTH, HEIGHT);

  RiText.defaultFont(monoFont,FONT_SIZE);
  RiText.defaultFontSize(FONT_SIZE);
  FILL  = (IVORY_ON_BLACK ? IVORY : BLACK);
  BACKGROUND = (IVORY_ON_BLACK ? BLACK : IVORY); 
  //
  RiText.defaultFill(FILL);

  literalAlts = JSON.parse(literalAlts.join(""));
  modelTexts = JSON.parse(texts.join(""));
  literalAlts = literalAlts[DEFAULT_LANGUAGE];
  modelTexts = modelTexts[DEFAULT_LANGUAGE];

  imageWidth = waveImages[0].width;
  imageHeight = waveImages[0].height;

  // ---- set up Gestures ----
  gestures = new Hammer.Manager(canvas);
  // gestures.set({ domEvents: true});
  // gestures.get("pinch").set({ enable: true });

  gestures.add(new Hammer.Swipe({ direction: Hammer.DIRECTION_ALL, domEvents: true }));
  gestures.add(new Hammer.Swipe({ event: "doubleswipe", pointers: 2 }) );
  gestures.add(new Hammer.Press());
  gestures.add(new Hammer.Press({ event: "doublepress", pointers: 2 }) );

  gestures.on("swipeleft", function() {
    if (keyLock) return false;
    standingOrder = changeStatus("next", true);
    // info("swipeleft: " + standingOrder);
  });

  gestures.on("swiperight", function() {
    if (keyLock) return false;
    standingOrder = changeStatus("previous", true);
    // info("swiperight: " + standingOrder);
  });

  gestures.on("doubleswipe", function() {
    if (keyLock) return false;
    standingOrder = changeStatus("quitting", true);
    // info("swipedown: " + standingOrder);
  });

  gestures.on("press", function() {
    if (keyLock) return false;
    standingOrder = "pressing";
    // info("press: " + standingOrder);
  });

  gestures.on("pressup", function() {
    if (keyLock) return false;
    standingOrder = "running";
    // info("pressup: " + standingOrder);
  });

  gestures.on("doublepress", function() {
    if (keyLock) return false;
    standingOrder = changeStatus("running", true);
    toggleAudio(paused);
    // info("swipeup: audio " + (withAudio ? "on" : "off"));
  });

  // ---- info Captions ----
  statusCaption = new RiText(statusCaptions[scIndex]);
  statusCaption.alpha(0);
  statusCaption.position(0,FONT_SIZE);
  setStatusCaption(statusCaptions[scIndex]);
  let capY = TEXT_Y + 3 * LEADING - LEADING / 2;
  for (var i = 0; i < modelTexts.length; i++) {
    captions.push(new RiText(""));
    captions[i].position(0, capY); // WIDTH - captions[i].textWidth() -4
    captions[i].alpha(0);
    // info(captions[i].y);
    capY += 5 * LEADING;
  }

  // ---- Titles ----
  titles.push("O V E R B O A R D");
  titles.push("John Cayley");
  titles.push("a m b i e n t   p o e t i c s");
  titles.push("QuickTime version 2003-4, refactured for the web 2018");
  titles.push("sounds organized together with Giles Perring");
  titles.push("p5.js, p5.js-sound, Daniel C. Howe’s RiTa");
  titles.push(" –> or mobile swipe-left to move on or quit by sinking");
  titles.push("<– or mobile swipe-right to go back to previous state");
  titles.push("Spacebar or mobile two-finger press to toggle audio");
  titles.push("hold Shift or mobile press for state information");
  titles.push("Q or mobile two-finger swipe-left to quit abruptly");
  titles.push("programmatology.shadoof.net/?overboard");

  titlePassage = new Passage();
  titlePassage.model = titles;

  lineY = 140;
  titlePassage.display = [titles.length];
  for (i = 0; i < titles.length; i++) {
    titlePassage.display[i] = new RiText(titles[i]);
    titlePassage.display[i].position(WIDTH/2 - titlePassage.display[i].textWidth()/2, lineY);
    // we're opening with all spaces, so replace letters with spaces
    titlePassage.display[i].text(titles[i].replace(/[a-z]/g," "));
    // adding a copy to the rt for crossFades
    titlePassage.display[i].fadeFrom = titlePassage.display[i].copy();
    titlePassage.display[i].fadeFrom.alpha(0);
    switch (i) {
    case 0: lineY += LEADING * 1.2; break;
    case 1: lineY += LEADING * 1.2; break;
    case 2: lineY += LEADING * .5; break;
    case 5: lineY += LEADING * .5; break;
    case 10: lineY += LEADING * .5; break;
    }
    lineY += LEADING;
  }

  // the following constructs an array, passages,
  // of Passage objects, adding
  // 1) the .model array of model strings, and
  // 2) a .display array of RiTexts with 
  // the currently displayed text (on right), and 
  // 3) .imgs, an array with line-correspondent
  // arrays of FXImage objects, wrapping p5Images
  // (for the visualization on the left)
  lineY = TEXT_Y;
  for (i = 0; i < modelTexts.length; i++) {
    passages.push(new Passage());
    passages[i].model = modelTexts[i];
    let passageLineLength = passages[i].model.length;
    passages[i].display = [ passageLineLength ];
    passages[i].imgs = [ passageLineLength ];
    for (var j = 0; j < passageLineLength; j++) {
      // actual text first
      passages[i].display[j] = new RiText(passages[i].model[j]);
      passages[i].display[j].position(TEXT_X, lineY);
      // were opening with all spaces, so replace letters with spaces
      fillWithSpaces(passages[i].display[j]);
      // adding a copy to the rt for crossFades
      passages[i].display[j].fadeFrom = passages[i].display[j].copy();
      passages[i].display[j].fadeFrom.alpha(0);
      lineY += LEADING;
      // now images
      let lineLength = passages[i].display[j].text().length;
      passages[i].imgs[j] = [ lineLength ];
      // the display passages are all spaces
      // so we only need to initialize the
      // corresponding images with a black rect
      waveImages[0].loadPixels();
      for (var k = 0; k < lineLength; k++) {
        let theImage = createImage(imageWidth,imageHeight);
        theImage.loadPixels();
        for (var p = 0; p < imageWidth * imageHeight * 4; p++) {
          theImage.pixels[p] = waveImages[0].pixels[p];
        }
        theImage.updatePixels();
        passages[i].imgs[j][k] = new FXImage(theImage);
      }
    }
    lineY += LEADING;
  }
  // the following for-loop lines are belt+braces since, it seems
  // that any p5.Images used as reference, for their pixels,
  // must call loadPixels during an initialization phase or else,
  // (the symptom was) they will not be accessible to the
  // members and methods, at least, of my FXImage wrapper
  // 'bug' discovered in earlier code, when:
  // not all waveImage objects were referenced
  // i.e. for j,q,x, and z which aren't in the model text.
  // This was a difficult bug to figure out!
  for (let image of waveImages) {
    image.loadPixels();
  }
  //
  // set cursors
  audioCursors.push(new AudioCursor(.3));
  //
  if (withAudio) {
    compressor = audioContext.createDynamicsCompressor();
    compressor.connect(audioContext.destination);

    // REF: cannot make 64 audioSources to cycle through
    // because buffers cannot be altered once set
    // for (var i = 0; i < 64; i++) {
    //   audioSources.push(audioContext.createBufferSource());
    // }

    // TODO: pans & volumes not yet working becuuse we are play()ing with Web Audio API
    // bell.pan(-.5);
    // bellsustained.playMode('sustain');
    letternotes = JSON.parse(letternotes.join(""));
    letternotes = letternotes[DEFAULT_LANGUAGE];
  } // withAudio

  // HERE WE GO
  overboard();

}

async function overboard() {
  var overboardPhases = [];
  overboardPhases.push(overboardTitles);
  overboardPhases.push(overboardSurface);
  overboardPhases.push(overboardAmbient);
  overboardPhases.push(overboardSink);
  //
  do {
    info("trying phase: " + phase);
    try {
      await overboardPhases[phase]();
      info("came back resolved in main do loop");
    } catch (err) {
      // 
      info("caught " + err.message + " in main do loop");
    }
    if (phase >= overboardPhases.length) standingOrder = "quitting";
    interrupted(standingOrder);
  }
  while (standingOrder == "running");
  //
}

async function overboardTitles() {
  fxSeconds = TITLES_FX_SECS;
  // make sure we can see the titles
  for (let rt of titlePassage.display) {
    rt.alpha(255);
  }
  for (let state of prevStates) {
    state = 1;
  }
  // make sure the images and display text are cleared
  for (let passage of passages) {
    var j = 0;
    for (let rt of passage.display) {
      fillWithSpaces(rt);
      for (let fxImage of passage.imgs[j++]) {
        replacePixels(fxImage.display,waveImages[0]);
      }
    }
  }

  try {
    await titlePassage.drift(SURFACING,0);
    standingOrder = changeStatus("next");
  } catch (err) {
    if (err.message == "previous" || err.message == "quitting") {
      // info("caught previous in overboardTitles");
      return Promise.reject(new Error(err.message));
    }
  }

  var i = 0;
  for (let rt of titlePassage.display) {
    rt.text(titlePassage.model[i++]);
  }
  standingOrder = "running";

  try {
    await overboardShowTitles (millis() + 30 * 1000);
    standingOrder = changeStatus("next");
  } catch (err) {
    if (err.message == "previous" || err.message == "quitting") {
      return Promise.reject(new Error(err.message));
    }
  }
  standingOrder = changeStatus("running");

  try {
    await titlePassage.drift(SINKING,0);
    standingOrder = changeStatus("next");
  } catch (err) {
    if (err.message == "previous" || err.message == "quitting") {
      // info("caught previous in overboardTitles");
      return Promise.reject(new Error(err.message));
    }
  }

  standingOrder = "running";
}

async function overboardShowTitles (titlesRead) {
  do {
    await sleep(1);
    if (standingOrder != "running" && standingOrder != "pressing") {
      return Promise.reject(new Error(standingOrder));
    }
  }
  while ((standingOrder == "running" || standingOrder == "pressing") && millis() < titlesRead);
}

async function overboardSurface() {
  fxSeconds = SUFLOSI_FX_SECS;
  // make sure the titlePassage is cleared away:
  for (let rt of titlePassage.display) {
    rt.alpha(0);
  }
  await sleep(1);
  
  promises = [];
  // opening up from blank, one time
  for (var i = 0; i < passages.length; i++) {
    prevStates[i] = 1;
    captions[i].text(BUOYANCY_STRINGS[SURFACING]);
    promises.push(passages[i].drift(SURFACING, 0));
  }
  // info("begin to surface (first Promise.all) in standingOrder: " + standingOrder);
  
  try {
    await Promise.all(promises);
    changeStatus("next");
  } catch(err) {
    return Promise.reject(new Error(err.message));
  }
}

async function overboardAmbient() {
  fxSeconds = SUFLOSI_FX_SECS;
  promises = [];
  // the continuous, ambient state
  try {
    await suflosi();
    standingOrder = changeStatus("next");
  } catch(err) {
    // info("catch in setup");
    return Promise.reject(new Error(err.message));
  }
}

async function overboardSink() {
  // end with sinking
  fxSeconds = SUFLOSI_FX_SECS;
  promises = [];
  for (var i = 0; i < passages.length; i++) {
    prevStates[i] = 2;
    captions[i].text(BUOYANCY_STRINGS[SINKING]);
    promises.push(passages[i].drift(SINKING, 0));
  }
  //
  try {
    await Promise.all(promises);
    standingOrder = changeStatus("next");
  } catch(err) {
    return Promise.reject(new Error(err.message));
  }
}

function interrupted(interruption) {
  // info(interruption + " at beginning of interrupted");
  switch (interruption) {
  case "quitting":
    for (var i = 0; i < captions.length; i++) {
      captions[i].text("");
    }
    standingOrder = changeStatus("quitting", true);
    withAudio = false;
    paused = true;
    noLoop();
    break;
  case "running":
  case "next":
  case "previous":
    standingOrder = "running";
    break;
  default:
    throw "unknown interruption";
  }
  // info(standingOrder + " at end of interrupted");
}

// this is marked aysnc so it returns a Promise?
function keyPressed() {
  info("---- key press ----");
  switch (keyCode) {
  case 32: // space
    standingOrder = changeStatus("running", true);
    toggleAudio(paused);
    break;
  case 37: // left arrow
    if (keyLock) return false;
    standingOrder = changeStatus("previous", true);
    // info("standingOrder: " + standingOrder);
    break;
  case 39: // right arrow
    if (keyLock) return false;
    standingOrder = changeStatus("next", true);
    // info("standingOrder: " + standingOrder);
    break;
  case 81: // q
    standingOrder = changeStatus("quitting", true);
    // info("standingOrder: " + standingOrder);
    break;
  }
  return false;
}

function changeStatus(newStatus, feedback) {
  feedback = feedback || false;
  switch (newStatus) {
  case "next":
    scIndex++;
    break;
  case "previous":
    scIndex--;
    if (scIndex < 3) scIndex = 0;
    break;
  case "quitting":
    scIndex = 6;
  }
  if (scIndex > 6) scIndex = 6;
  if (scIndex < 0) scIndex = 0;
  let newStatusCap = statusCaptions[scIndex];
  if (scIndex == 3) {
    if (firstGasp) {
      firstGasp = false;
      newStatusCap += " to open";
    }
  }
  phase = scIndex - 2;
  if (phase < 0) phase = 0;
  setStatusCaption(newStatusCap);
  if (feedback) showStatusUntil = millis() + 3000;
  return newStatus;
}

function setStatusCaption(newStatusCap) {
  if (!newStatusCap) {
    let statusCap = statusCaption.text();
    statusCap = statusCap.substring(0,statusCap.indexOf(" - "));
    return statusCap;
  } 
  let ps = paused ? " - audio paused" : " - audio on";
  // ps += ", scIndex: " + scIndex + ", phase: " + phase;
  statusCaption.text(newStatusCap + (newStatusCap == "overboard quit" ? "" : ps));
}

// ---- DRAWING FUNCTIONS ----
function draw() {
  background(BACKGROUND);

  if (!paused) {
    for (var i = 0; i < audioCursors.length; i++) {
      if (audioCursors[i]) audioCursors[i].update();
    }    
  }

  if (phase != 0) drawImages();

  if (keyIsDown(16) || standingOrder == "quitting" || standingOrder == "pressing") {
    if (phase != 0) {
      for (let caption of captions) {
        caption.alpha(95);
      }
    }
    statusCaption.alpha(95);
    cursor();
  } else {
    for (let caption of captions) {
      caption.alpha(0);
    }
    statusCaption.alpha(0);
    if (PRODUCTION) noCursor();
  }

  if (millis() < showStatusUntil) statusCaption.alpha(95);

  RiText.drawAll();
}

function drawImages() {
  var ix = IMG_X, iy = TEXT_Y - (FONT_SIZE - 2);
  for (let passage of passages) {
    for (let fxImages of passage.imgs) {
      for (let fxImage of fxImages) {
        fxImage.update();
        image(fxImage.display,ix,iy,imageWidth*.48,imageHeight*.45);
        ix += 12;
      }
      ix = IMG_X;
      iy += LEADING;
    }
    iy += LEADING;
  }
}

// ----- MAIN TOP LEVEL FUNCTION -----
async function suflosi() {
  // reproduces the logic of the
  // QuickTime version
  var newState, prevState, statesNum;
  var sPromises;
  while (standingOrder == "running" || standingOrder == "pressing") {
    sPromises = [];
    statesNum = getRndInteger(0,7);
    for (var p = 0; p < passages.length; p++) {
      newState = states[statesNum].state[p];
      if (newState > 0) {
        prevState = prevStates[p];
        switch (prevState) {
        case 0:
          newState = newState + getRndInteger(0,1);
          break;
        case 1:
          newState = 2;
          break;
        case 2:
          newState = 1;
        }
      }
      prevStates[p] = newState;
      captions[p].text(BUOYANCY_STRINGS[newState]);
      sPromises.push(passages[p].drift(newState, states[statesNum].seconds));
    }
    // info("states: " + JSON.stringify(prevStates) + "; " + "playCount: " + playCount);
    try {
      await Promise.all(sPromises);
    } catch(err) {
      // info("catch in suflosi");
      if (err.message == "quitting" || err.message == "next" || err.message == "previous") {
        return Promise.reject(new Error(err.message));
      } else {
        throw err;
      }
    }
  } // END while
} // END suflosi

// ----- PASSAGE obect FUNCTIONS -----
var Passage = function Passage(buoyancy) {
  this.buoyancy = buoyancy || 1;
};

Passage.prototype.drift = async function (buoyancy, seconds) { // , language
  // language = language || DEFAULT_LANGUAGE;
  var finish = millis() + seconds * 1000;
  do {
    var rndIndexes = rndIndex(this.model);
    // info(rndIndexes);
    for (var l = 0; l < this.model.length; l++) {
      let rl = rndIndexes[l];
      let modelLetters = this.model[rl].split("");
      let displayLetters = this.display[rl].text().split("");
      var previousLetters = [];
      NEXT_letter: for (var i = 0; i < modelLetters.length; i++) {
        previousLetters.push(displayLetters[i]);
        let diff, theCase;
        switch (buoyancy) {
        case FLOATING:
          // do nothing if SPC's are matching
          if (modelLetters[i] === SPC && displayLetters[i] === SPC) continue NEXT_letter;
          // if heads address a space on the display text that could be a letter
          if (modelLetters[i] !== SPC && (displayLetters[i] === SPC && heads())) {
            // on heads, makes it a model letter
            if (heads()) displayLetters[i] = modelLetters[i];
            else {
              // floating, so on tails make it the alternate 
              displayLetters[i] = (modelLetters[i] in literalAlts ? literalAlts[modelLetters[i]] : displayLetters[i]);
            }
            break;
          }
          // check to see if display letter is in the alternates table handles SPC in display
          if (!(displayLetters[i] in literalAlts)) break;
          // on heads, if the model letter is a space maake this so in display
          if ((modelLetters[i] === SPC) && heads()) {
            displayLetters[i] = SPC;
            break;
          }
          // in all other cases on heads, on heads get alternate for what is there
          if (heads()) {
            // if (displayLetters[i] === "i") info("alt for i:" + literalAlts[language][modelLetters[i]]);
            displayLetters[i] = literalAlts[displayLetters[i]];
          } else {
            // on tails get the model letter
            displayLetters[i] = modelLetters[i];
          }
          break;
        case SINKING:
          diff = diffFactor(modelLetters, displayLetters, buoyancy);
          if (displayLetters[i] === SPC) continue NEXT_letter;
          if (!(modelLetters[i] in literalAlts)) {
            if (getRndInteger(0, diff < .3 ? 0 : 1) == 0) displayLetters[i] = SPC;
            continue NEXT_letter;
          }
          // emulating, but improving translation
          theCase = getRndInteger(1,Math.floor(18 * diff + 2));
          switch (theCase) {
          case 1:
          case 2:
            displayLetters[i] = SPC;
            break;
          case 3:
            displayLetters[i] = (modelLetters[i] in literalAlts) ? literalAlts[modelLetters[i]] : SPC;
            break;
          case 4:
            displayLetters[i] = modelLetters[i];
          }
          break;
        case SURFACING:
          if (displayLetters[i] === modelLetters[i]) continue NEXT_letter;
          if (displayLetters[i] === SPC) {
            // info(Math.floor(7 * diffFactor(modelLetters, displayLetters)));
            if  (getRndInteger(0,Math.floor(7 * diffFactor(modelLetters, displayLetters, buoyancy))) == 0) {
              // info("handling SPC with odds: " + Math.floor(7 * diffFactor(modelLetters, displayLetters)));
              if (heads() || (diffFactor(modelLetters, displayLetters, buoyancy) < .1)) displayLetters[i] = modelLetters[i];
              else displayLetters[i] = (modelLetters[i] in literalAlts) ? literalAlts[modelLetters[i]] : modelLetters[i];
            }
          } else {
            if (heads() || (diffFactor(modelLetters, displayLetters, buoyancy) < .4)) displayLetters[i] = modelLetters[i];
          }
        }
      } // NEXT_letter
      if (standingOrder != "running" && standingOrder != "pressing") {
        if (phase == 0 && standingOrder == "previous") {
          // clear away text immediately if going back to "previous" titles
          for (let passage of passages) {
            for (let rt of passage.display) {
              fillWithSpaces(rt);
            }
          }
        }
        // make sure concurrent Promises resolve
        keyLock = true;
        await sleep(fxSeconds * 1.5);
        keyLock = false;
        return Promise.reject(new Error(standingOrder));
      }
      if (phase != 0) {
        // info("line " + rl + ": " + displayLetters[0]);
        for (var wi = 0; wi < displayLetters.length; wi++) {
          if (displayLetters[wi] !== previousLetters[wi]) {
            let fromImage = waveImages[ABC.indexOf(previousLetters[wi])];
            let toImage = waveImages[ABC.indexOf(displayLetters[wi])];
            this.imgs[rl][wi].xFade(fxSeconds,toImage,fromImage);
          }
        }
      }
      textTo(this.display[rl],displayLetters.join(""),fxSeconds, true);
      // info("awaiting begins for " + xfpromises.length);
      await sleep(fxSeconds * 1.2);
      // info("awaiting over");
    } // NEXT_line
    // figure out if we should keep going
    var done = (standingOrder != "running" && standingOrder != "pressing") ? true : false;
    if (!done)
      done = (seconds > 0) && (millis() > finish);
    if (!done) {
      done = (buoyancy == SURFACING || buoyancy == SINKING);
      done = (done) ? passagesMatch(this.model,this.display,buoyancy) : false;
    }
  } // do
  while (!done);
};

// ---- GENERAL PURPOSE FUNCTIONS -----
function diffFactor(model, display, buoyancy) {
  buoyancy = buoyancy || SURFACING;
  var diff = 0, len = model.length;
  for (var i = 0; i < len; i++) {
    if (buoyancy == SURFACING)
      diff += (display[i] !== model[i] ? 1 : 0);
    else
      diff += (display[i] !== SPC ? 1 : 0);
  }
  return diff / len;
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function heads() {
  return getRndInteger(0,1) === 0;
}

function info(msg) {
  console.log("[INFO] " + msg);
}

// utility for overboard only, returns int: 0-27; ABC is global
function letterNumAt(p,l,x) {
  return ABC.indexOf(charAt(p,l,x));
}

// function letterNumAtWas(p,l,x) {
//   return ABC.indexOf(charAtWas(p,l,x));
// }

function charAt(p,l,x) {
  return passages[p].display[l].charAt(x);
}

function charAtWas(p,l,x) {
  return passages[p].model[l].charAt(x);
}

function charIsInflected(p,l,x) {
  return (passages[p].display[l].charAt(x) !== charAtWas(p,l,x));
}

function fillWithSpaces(rt) {
  rt.text(rt.text().replace(/[a-z]/gi,SPC));
}

function passagesMatch(modelPassage, displayPassage, buoyancy) {
  var result = true;
  switch (buoyancy) {
  case SURFACING:
    for (var i = 0; i < modelPassage.length; i++) {
      if (modelPassage[i] !== displayPassage[i].text())
        return false;
    }
    break;
  case SINKING:
    for (let rt of displayPassage) {
      let chars = rt.text().split("");
      for (let char of chars) {
        if (char !== SPC) return false;
      }
    }
  }
  return result;
}

function playSound(instrument,midinote,atTime) {
  atTime = audioContext.currentTime + atTime / 1000 || 0;
  var source = audioContext.createBufferSource();
  source.buffer = instrument.buffer;
  source.connect(compressor); // audioContext.destination
  source.playbackRate.value = Math.pow(SEMITONE_RATIO, midinote - BASE_NOTE);
  // source.detune.value = semitones * 100;
  source.start(atTime);
}

// function rateWithBase(BASE_NOTE,noteNum) {
//   let step = Math.abs(BASE_NOTE - noteNum);
//   let factor = Math.pow(2,step/12);
//   return (noteNum < BASE_NOTE) ? 1 / factor : 1 * factor;
// }

function rndIndex(a) {
  let ints = [];
  for (var i = 0; i < a.length; i++) {
    ints.push(i);
  }
  return ints.shuffle();
}

// a general utility fuction for p5 Images
function replacePixels(existing, replaceWith) {
  existing.loadPixels();
  replaceWith.loadPixels();
  // for (var p = 0; p < 4 * (existing.width * existing.height); p++) {
  //   existing.pixels[p] = replaceWith.pixels[p];
  // }
  var p = 0;
  for (let pixel of replaceWith.pixels) {
    existing.pixels[p++] = pixel;
  }
  existing.updatePixels();
}

Array.prototype.shuffle = function() {
  // var input = this;
  for (var i = this.length-1; i >=0; i--) {
    let randomIndex = Math.floor(Math.random()*(i+1)); 
    let itemAtIndex = this[randomIndex]; 
    this[randomIndex] = this[i]; 
    this[i] = itemAtIndex;
  }
  return this;
};

function sleep(s) {
  return new Promise(resolve => setTimeout(resolve, s * 1000));
}

// ---- requires RiTexts -----
function textTo(rt, newWord, seconds, fullOn) {
  if (rt.text() === newWord) return;
  // let temp = rt.copy();
  rt.fadeFrom.text(rt.text());
  var originalAlpha = rt.alpha();
  // ensures that fade-in goes to 255
  if (fullOn) originalAlpha = 255;
  rt.fadeFrom.alpha(originalAlpha);
  // make original invisible leaving copy
  rt.alpha(0);
  // put new text into the invisible original
  rt.text(newWord);
  // fade out the copy 
  rt.fadeFrom.colorTo([rt._color.r, rt._color.g, rt._color.b, 0], seconds);
  // fade in the orginal with new text
  rt.colorTo([rt._color.r, rt._color.g, rt._color.b, originalAlpha], seconds * .3);
}

function toggleAudio(p) {
  if (p) {
    paused = false;
    withAudio = true;
    for (let ac of audioCursors) {
      replacePixels(ac.cursorImage,cursorImages[letterNumAt(ac.p, ac.l, ac.x)]);
      replacePixels(ac.cursorUnder,passages[ac.p].imgs[ac.l][ac.x].display);
      replacePixels(passages[ac.p].imgs[ac.l][ac.x].display, ac.cursorImage);
      ac.lastStep = millis();
    }
    // for (var i = 0; i < audioCursors.length; i++) {
    //   audioCursors[i].lastStep = millis();
    // }
    if (getAudioContext().state !== "running")
      getAudioContext().resume();
  } else {
    paused = true;
    withAudio = false;
    for (let ac of audioCursors) {
      replacePixels(passages[ac.p].imgs[ac.l][ac.x].display, ac.cursorUnder);
    }
    for (let sound of sounds) {
      sound.stop();
    }
    // for (var i = 0; i < audioCursors.length; i++) {
    //   replacePixels(passages[audioCursors[i].p].imgs[audioCursors[i].l][audioCursors[i].x].display, audioCursors[i].cursorUnder);
    // }
  }
  setStatusCaption(setStatusCaption());
}

// ---- OBJECTS wrapping p5 Images ----

// ---- FXImage -----
var FXImage = function FXImage(fromImage, toImage) {
  this.startTime = -1; // -1
  this.duration = -1; // -1
  this.w = fromImage ? fromImage.width : imageWidth;
  this.h = fromImage ? fromImage.height : imageHeight;
  this.from = createImage(this.w, this.h);
  this.display = createImage(this.w, this.h);
  if (fromImage) {
    replacePixels(this.from, fromImage);
    replacePixels(this.display, fromImage);
  }
  this.to = createImage(this.w, this.h);
  if (toImage) replacePixels(this.to, toImage);
};

FXImage.prototype.update = function() {
  // TODO: make this work with AudioCursor
  if (this.startTime == -1) {
    return;
  } else if (millis() > (this.startTime + this.duration)) {
    this.startTime = -1;
    return;
  }
  this.display.loadPixels();
  this.from.loadPixels();
  this.to.loadPixels();
  var xFactor = map(millis(),this.startTime, this.startTime + this.duration, 0, 1);
  xFactor = constrain(xFactor, 0, 1);
  // info(xFactor);
  for (var p = 0; p < 4 * (this.w * this.h); p += 4) {
    for (var c = 0; c < 3; c++) {
      let f = this.from.pixels[p+c], t = this.to.pixels[p+c];
      this.display.pixels[p+c] = xFactor * t + (1 - xFactor) * f;
    }
  }
  this.display.updatePixels();
};

FXImage.prototype.xFade = function(duration, toImage, fromImage) {
  this.startTime = millis();
  this.duration = duration * 1000;

  // NEW
  replacePixels(this.to, toImage);
  if (fromImage) {
    // info["fromImage was passed"];
    replacePixels(this.from, fromImage);
    replacePixels(this.display, fromImage);
  } else {
    replacePixels(this.from, this.display);
  }
};

// ----- AudioCursor (with Visual Behavior) -----
var AudioCursor = function AudioCursor(speed,p,l,x,cursorImage) {
  this.lastStep = millis();
  this.firstMove = true;
  this.speed = speed || 1.5;
  this.p = p || 0;
  this.l = l || 0;
  this.x = x || 0;
  this.w = cursorImage ? cursorImage.width : imageWidth;
  this.h = cursorImage ? cursorImage.height : imageHeight;
  // info(cursorImages[letterNumAt(this.p,this.l,this.x)].width);
  this.cursorImage = createImage(this.w, this.h);
  this.cursorUnder = createImage(this.w, this.h);
  // replacePixels(this.cursorImage,cursorImage || cursorImages[letterNumAt(this.p,this.l,this.x)]);
  // replacePixels(this.cursorUnder,passages[this.p].imgs[this.l][this.x].display);
  // replacePixels(passages[this.p].imgs[this.l][this.x].display,this.cursorImage);
};

AudioCursor.prototype.update = function() {
  // is it time to step onwards?
  if (millis() > this.lastStep + this.speed * 1000) {
    // put back the underlying image:
    replacePixels(passages[this.p].imgs[this.l][this.x].display, this.cursorUnder);
    // moving to next cursor position first time
    this.x++;
    if (this.x >= passages[this.p].imgs[this.l].length) {
      this.x = 0;
      this.l++;
      if (this.l >= passages[this.p].imgs.length) {
        this.l = 0;
        this.p++;
        if (this.p >= passages.length) this.p = 0;
      }
    }
    // set aside the new underlying image
    replacePixels(this.cursorUnder,passages[this.p].imgs[this.l][this.x].to);
    var letter = charAt(this.p,this.l,this.x);
    var letterNum = letterNumAt(this.p,this.l,this.x);
    var letterWas = charAtWas(this.p,this.l,this.x);
    var altLetterNum = ABC.indexOf(literalAlts[letter]);
    var buoyancy = prevStates[this.p];
    // get the appropriate letter-determined cursor image
    let newCursorImage = cursorImages[letterNumAt(this.p,this.l,this.x)];
    // or wave image if floating
    if (buoyancy == FLOATING && letterNum != SPC_NUM) {
      // info("this.p: " + this.p + " buoyancy: " + buoyancy + " letterNum: " + letterNum + " altLetterNum: " + altLetterNum);
      newCursorImage = waveImages[altLetterNum];
    }
    // replace the pixels here
    replacePixels(this.cursorImage,newCursorImage);
    // -- audio behavior --
    if (withAudio) {
      doAudioBehavior(this, buoyancy, letterNum, letterWas, letter);
    }
    // display the cursor image at the current position:
    replacePixels(passages[this.p].imgs[this.l][this.x].display, this.cursorImage);
    //
    this.lastStep = millis();
  }
};

function doAudioBehavior(audioCursor, buoyancy, letterNum, letterWas, letter) {
  var rollLo,rollHi,rollVeloc,bellVeloc,bellsustainedVeloc;
  if (millis() > lastBreath) {
    lastBreath = millis() + BREATH;
    breathin = !breathin;
  }
  switch (buoyancy) {
  case FLOATING:
    rollLo = 54;
    rollHi = 68;
    // TODO: rollVeloc not yet used
    rollVeloc = .4;
    //
    bellVeloc = .7;
    bellsustainedVeloc = 1;
    break;
  case SURFACING:
    rollLo = 65;
    rollHi = 85;
    rollVeloc = .35;
    //
    bellVeloc = 1;
    bellsustainedVeloc = 1;
    break;
  case SINKING:
    rollLo = 23;
    rollHi = 48;
    rollVeloc = .96;
    //
    bellVeloc = .2;
    bellsustainedVeloc = 1;
  }
  let inflected = charIsInflected(audioCursor.p,audioCursor.l,audioCursor.x);
  if (letterNum > SPC_NUM) {
    // not a space
    let midinote = letternotes[inflected ? "lo" : "hi"][letter];
    // let bellRate = rateWithBase(BASE_NOTE,midinote); // map(midinote,22,85,.45,16);

    // if (1 != 1) {
    //   info(letter + ": " + midinote + " " + bellRate);
    // }
    // ——— VOLUME ———
    bell.setVolume(bellVeloc,buoyancy = SINKING ? 3 : 1);
    if (inflected) {
      // sustained for 2 seconds
      bell.setVolume(bellsustainedVeloc,1);
      playSound(bell,midinote);
      // bellsustained.play(0,bellRate); // ,undefined,undefined,2
      playCount++;
    } else {
      playSound(bell,midinote);
      // bell.play(0,bellRate); // play(now,at rate)
      playCount++;
    }
  } else {
    // ——— VOLUME ———
    rolls.setVolume(rollVeloc,2);
    if (letterWas == SPC) {
      // if (was an original space) rising or lowering rolls:
      var rollNote = getRndInteger(rollLo,rollHi);
      var endNote = rollNote + 5;
      if (breathin) {
        // info(BUOYANCY_STRINGS[buoyancy] + " rising in-breath space");
        for (var delay = 0; delay < SUFLOSI_FX_SECS * 5; delay+= SUFLOSI_FX_SECS) {
          // rollrate = rateWithBase(BASE_NOTE,rollNote + bend);
          // rolls.play(bend,rollrate); // ,undefined,undefined,5
          playSound(rolls,rollNote++, delay);
          // bend++; // up one semitone
          playCount++;
        }
      } else {
        // info(BUOYANCY_STRINGS[buoyancy] + " falling out-breath space");
        rollNote = endNote;
        for (delay = 0; delay < SUFLOSI_FX_SECS * 5; delay+= SUFLOSI_FX_SECS) {
          // rollrate = rateWithBase(BASE_NOTE,rollNote - bend);
          // rolls.play(bend,rollrate); // ,undefined,undefined,5
          playSound(rolls,rollNote--, delay);
          // bend--;
          playCount++;
        }
      }
      // breathin = !breathin; // if breathing is based on hitting a space
    } else { 
      // not a space in the origText
      // info(BUOYANCY_STRINGS[buoyancy] + " non-original space");
      rollNote = getRndInteger(rollLo,rollHi);
      playSound(rolls,rollNote);
      // rollrate = rateWithBase(BASE_NOTE,rollNote);
      // rolls.play(0,rollrate); // ,undefined,undefined,5
    } // letterWas originally space
  }
}

// demo "Script"
// caption = new RiText("English",960,660,captionFont);
// caption.alpha(94);

// seconds = 2;
// info("Showing English for " + seconds + " seconds")
// await sleep(seconds);

// seconds = 10;
// textTo(caption,"English – floating",2);
// info("Floating in English for " + seconds + " seconds")
// await allFloating(seconds);

// seconds = 15;
// textTo(caption,"English – sinking",2);
// info("Sinking in English for " + seconds + " seconds")
// await allSinking(seconds);

// textTo(caption,"English – surfacing",2);
// info("Surfacing English")
// await allSurfacing(0);

// textTo(caption,"English",2);
// info("Done");