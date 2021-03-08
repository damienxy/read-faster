(function () {
  const mainElem = document.getElementById('main');
  const outputElem = document.getElementById('output');
  const textAreaElem = document.getElementById('text-area');
  const fontTypeElem = document.getElementById('font-type');
  const speedElem = document.getElementById('speed');
  const pauseElem = document.getElementById('pause');
  const repeatElem = document.getElementById('repeat');
  const backElem = document.getElementById('back');
  const fontSizeMinusElem = document.getElementById('font-size-minus');
  const fontSizePlusElem = document.getElementById('font-size-plus');
  const fontTypeMinusElem = document.getElementById('font-type-minus');
  const fontTypePlusElem = document.getElementById('font-type-plus');
  const speedMinusElem = document.getElementById('speed-minus');
  const speedPlusElem = document.getElementById('speed-plus');
  const darkModeElem = document.getElementById('dark-mode');

  // Constants
  const fontTypes = [
    'Helvetica',
    'Verdana',
    'Courier',
    'Courier New',
    'Palatino',
    'Garamond',
    'Bookman',
    'Arial',
    'Tahoma',
    'Impact',
    'Didot',
    'Georgia',
    'Andalé Mono',
    'Monaco',
    'Luminari'
  ];
  const fontCount = fontTypes.length;
  const prompt = 'Paste some text below to start.';

  // Variables
  let darkMode = JSON.parse(localStorage.getItem('darkMode')) ?? false;
  let fontType = JSON.parse(localStorage.getItem('fontType')) ?? 0;
  let fontSize = JSON.parse(localStorage.getItem('fontSize')) ?? 32;
  let wpm = JSON.parse(localStorage.getItem('wpm')) ?? 200;
  let sentences = [];
  let sentenceIndex = 0;
  let wordIndex = 0;
  let delay = 60000 / wpm;
  let timeouts = [];
  let pause = false;

  // Helper functions
  const setContent = (elem, value) => (elem.innerHTML = value);
  const setStyle = (elem, attribute, value) => (elem.style[attribute] = value);
  const changeClass = (elem, remove, add) => {
    elem.classList.remove(remove);
    elem.classList.add(add);
  };

  const sleep = ms => {
    let timeout;
    return [
      new Promise(resolve => (timeout = setTimeout(resolve, ms))),
      () => clearTimeout(timeout)
    ];
  };

  const clearAllTimeouts = () => {
    timeouts.forEach(timeout => timeout());
    timeouts = [];
  };

  const reset = () => {
    clearAllTimeouts();
    setContent(outputElem, prompt);
    sentenceIndex = 0;
    wordIndex = 0;
  };

  // Text output
  const displayText = () => {
    reset();
    setCurrentText();
    displayWords();
  };

  const setCurrentText = () =>
    (sentences = splitIntoSentences(textAreaElem.value || ''));

  const splitIntoSentences = text =>
    text.split(/([\.\!\?]+)(?=\s+(?:[A-Z\d]))/).reduce((acc, cur, i) => {
      if (i % 2 === 0) {
        return [...acc, cur];
      } else {
        acc[acc.length - 1] = acc[acc.length - 1].trim() + cur;
        return acc;
      }
    }, []);

  const displayWords = async () => {
    const sentencesToShow = sentences.slice(sentenceIndex);
    for (let s of sentencesToShow) {
      const words = splitIntoWords(s);
      const wordsToShow = words.slice(wordIndex);
      for (let word of wordsToShow) {
        setContent(outputElem, word);
        const [wait, clear] = sleep(delay);
        timeouts.push(clear);
        await wait;
        wordIndex++;
      }
      wordIndex = 0;
      sentenceIndex++;
    }
  };

  const splitIntoWords = text => text.split(' ').filter(w => w.trim() != '');

  // Settings
  const togglePause = () => (pause ? setPlay() : setPause());

  const setPlay = () => {
    pause = false;
    setPlayIcon();
    displayWords();
  };

  const setPause = () => {
    pause = true;
    setPauseIcon();
    clearAllTimeouts();
  };

  const setPlayIcon = () => setContent(pauseElem, '&#x2759;&#x2759;');
  const setPauseIcon = () => setContent(pauseElem, '&#9658;');

  const repeatAll = () => {
    reset();
    setPlay();
  };

  const repeatSentence = () => {
    clearAllTimeouts();
    wordIndex = 0;
    sentenceIndex && sentenceIndex--;
    setPlay();
  };

  const changeFontSize = type => {
    fontSize = type === 'plus' ? fontSize + 2 : fontSize - 2;
    setFontSize();
  };

  setFontSize = () => {
    setStyle(outputElem, 'fontSize', fontSize + 'px');
    localStorage.setItem('fontSize', fontSize);
  };

  const changeFontType = type => {
    if (type === 'minus') {
      fontType = fontType === 0 ? fontCount - 1 : fontType - 1;
    } else {
      fontType = fontType === fontCount - 1 ? 0 : fontType + 1;
    }
    setFontType();
  };

  const setFontType = () => {
    const newFont = fontTypes[fontType];
    const elements = [outputElem, fontTypeElem];
    elements.forEach(elem => setStyle(elem, 'fontFamily', newFont));
    setContent(fontTypeElem, newFont);
    localStorage.setItem('fontType', fontType);
  };

  const changeSpeed = type => {
    if (type === 'minus') {
      wpm = wpm >= 10 ? wpm - 10 : wpm;
    } else {
      wpm = wpm + 10;
    }
    setSpeed();
  };

  setSpeed = () => {
    delay = 60000 / (wpm || 1);
    setContent(speedElem, wpm + 'wpm');
    localStorage.setItem('wpm', wpm);
  };

  const toggleDarkMode = () => {
    darkMode = !darkMode;
    setDarkMode();
  };

  const setDarkMode = () => {
    const elements = [mainElem, textAreaElem];
    const remove = darkMode ? 'light-mode' : 'dark-mode';
    const add = darkMode ? 'dark-mode' : 'light-mode';
    elements.forEach(elem => changeClass(elem, remove, add));
    localStorage.setItem('darkMode', darkMode);
  };

  // Event listeners
  repeatElem.addEventListener('click', repeatAll);
  pauseElem.addEventListener('click', togglePause);
  backElem.addEventListener('click', repeatSentence);
  fontSizeMinusElem.addEventListener('click', () => changeFontSize('minus'));
  fontSizePlusElem.addEventListener('click', () => changeFontSize('plus'));
  fontTypeMinusElem.addEventListener('click', () => changeFontType('minus'));
  fontTypePlusElem.addEventListener('click', () => changeFontType('plus'));
  speedMinusElem.addEventListener('click', () => changeSpeed('minus'));
  speedPlusElem.addEventListener('click', () => changeSpeed('plus'));
  darkModeElem.addEventListener('click', toggleDarkMode);
  textAreaElem.addEventListener('input', displayText);

  // Intitialization
  const initialize = () => {
    setFontSize();
    setFontType();
    setSpeed();
    setDarkMode();
    displayText();
  };

  initialize();
})();
