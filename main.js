/**
 * The URIs of text files to request
 */
const requestURIs = {
  dictionary: 'dictionary.txt',
  story: 'story.txt',
};

/**
 * Fetch request parameters
 */
const fetchParams = {

};

/**
 * The references to elements on the page to render into
 */
const elements = {
  dictionary: null,
  story: null,
  words: null,
  optionsIncludePunctuation: null,
  optionsIncludeCapitalization: null,
  optionsSubmit: null,
};

/**
 * Regular Expressions
 */
const regex = {
  filterWhitespace: new RegExp(/\n|\s/gm),
  filterAlphaNumericAndApostrophe: new RegExp(/[^(\w|\d|^\'|\u2019)]/gm),
  notAlphaNumeric: new RegExp(/[^(\w|\d|)]/gm)
};

/**
 * State of options flags
 */
const flags = {
  punctuation: true,
  capitalization: true,
}

const data = null;

// String Utility Functions

/**
 * Utility to split a string into an array following a regular expression,
 * ensuring trailing whitespaces are culled from the resulting array
 * @param {string} str The string to split
 * @param {RegEx} regex The regex to use
 * @returns Array of type string
 */
const splitAndTrim = (str, regex) => {
  return str.trim().split(regex).filter((string) => string !== '')
};

/**
 * Compares two strings against each other to determine how close they are to each other
 * @param {string} wordA The string to compare with
 * @param {string} wordB The string to compare against
 * @returns Value between 0 (no match) and 1 (full match)
 */
const compareStrings = (wordA, wordB) => {
  // determine larger length
  let divisor = wordB.length;
  if (wordA.length > wordB.length) {
    divisor = wordA.length;
  }

  // split words by character
  const splitA = wordA.split('');
  const splitB = wordB.split('');

  // find any matching characters
  let matchingCharacters = 0;
  splitA.forEach((character) => {
    if (splitB.includes(character)) {
      matchingCharacters++;
    }
  });

  // match value is a ratio of matches to length
  return matchingCharacters / divisor;
};

/**
 * 
 * @param {string} word The word to find the closest match in the dictionary for
 * @param {Array<string>} dictionary The dictionary to search for matches in
 * @returns Object containing 'value' (of type number, the % matching) and 'word' (of type string, the best match)
 */
const determineBestMatch = (word, dictionary) => {
  // return early if the dictionary includes a word
  // with an object containing a value of 1 and the word set to itself
  if (dictionary.includes(word)) {
    return {
      value: 1,
      word,
    };
  }

  else {
    // iterate over the dictionary assigning a match value to each dictionary word
    const matchValues = dictionary.map((dictionaryWord) => {
      // if not counting punctuation, filter it from the words
      if (flags.punctuation === false) {
        word = word.replace(regex.notAlphaNumeric, '');
        dictionaryWord = dictionaryWord.replace(regex.notAlphaNumeric, '');
      }
      // if not counting capitalization, make words lowercase
      if (flags.capitalization === false) {
        word = word.toLowerCase();
        dictionaryWord = dictionaryWord.toLowerCase();
      }
      return compareStrings(word, dictionaryWord)
    });

    // determine the best match and its index by comparing match values to each other
    let best = -1;
    let indexOfBest = -1;
    for (let i = 0; i < matchValues.length; i++) {
      if (matchValues[i] > best) {
        best = matchValues[i];
        indexOfBest = i;
      }
    }

    // return an object with value being the best match value
    // and the word being the best matching word in the dictionary
    return {
      value: best,
      word: dictionary[indexOfBest]
    }
  }
};

// UI Modification Functions

/**
 * Get references to body elements on page load
 */
 const resolveBodyElements = () => {
  elements.words = document.querySelector('#words tbody');
  elements.story = document.querySelector('#story p');
  elements.dictionary = document.querySelector('#dictionary ul');
  elements.optionsIncludePunctuation = document.querySelector('#punctuation');
  elements.optionsIncludeCapitalization = document.querySelector('#capitalization');
  elements.optionsSubmit = document.querySelector('#submit');
};

/**
 * Resets body elements that will be populated later
 */
const resetBodyElements = () => {
  elements.words.innerHTML = '';
  elements.story.innerHTML = '';
  elements.dictionary.innerHTML = '';
}

/**
 * Modifies the UI to display words not present in the dictionary
 * @param {Array<string>} matchedWords The word match data array
 */
const displayClosestMatches = (matchedWords) => {
  matchedWords.forEach((word) => {
    if (word.match.value < 1) {
      const listElement = document.createElement('tr');
      listElement.innerHTML = `<td>${word.word}</td><td>${word.match.word}</td><td>${(word.match.value * 100).toFixed(2)}</td>`;
      elements.words.appendChild(listElement);
    }
  });
};

/**
 * Modifies the UI to display the resulting parsed text data
 * @param {Array<string>} dictionaryWords The array of words in the dictionary
 * @param {string} story The story string
 */
const displayParsedTextData = (dictionaryWords, story) => {
  dictionaryWords.forEach((string) => {
    const listElement = document.createElement('li');
    listElement.innerHTML = string;
    elements.dictionary.appendChild(listElement);
  });

  elements.story.innerHTML = story;
}

// Promise Functions

/**
 * Creates fetch requests for text URIs
 * @returns Response array
 */
const getTextData = async () => {
  const requests = Object.values(requestURIs).map((uri) => fetch(uri, fetchParams));
  const responses = await Promise.all(requests);
  return responses;
};

/**
 * Parses retrieved data into text() form
 * @param {Array<Response>} responses Response array to map into a new Promise array
 * @returns Promise array that will convert responses to string, i.e. result of Response.text()
 */
const parseTextData = async (responses) => {
  const parsed = await Promise.all(responses.map((response) => response.text()));
  return parsed;
};

/**
 * Utilizes retrieved text data in the app
 * @param {Array<string>} data The string data to work with
 * @returns data turned into Promise
 */
const resolveParsedTextData = async (data) => {
  const dictionaryWords = splitAndTrim(data[0], regex.filterWhitespace);
  const storyWords = splitAndTrim(data[1], new RegExp(regex.filterWhitespace.source + '|' + regex.filterAlphaNumericAndApostrophe.source));
  const story = data[1];

  // iterate over the story words by finding the best match
  const matchedWords = storyWords.map((word) => ({
    word,
    match: determineBestMatch(word, dictionaryWords),
  }));

  displayParsedTextData(dictionaryWords, story);
  displayClosestMatches(matchedWords);
  
  return Promise.resolve(data);
};

// State Functions

/**
 * Sets the current state of the options flags
 */
setFlags = () => {
  flags.capitalization = elements.optionsIncludeCapitalization.checked;
  flags.punctuation = elements.optionsIncludePunctuation.checked;
};

// Event Handlers

/**
 * Handler for options submit button
 * @param {Event} e Event data
 */
const onSubmit = (e) => {
  e.preventDefault();
  resetBodyElements();
  setFlags();
  getTextData()
    .then(parseTextData)
    .then(resolveParsedTextData)
}

// Main Functions

/**
 * Entry point for the app, assigned to window.onload
 */
const init = () => {
  resolveBodyElements();
  elements.optionsSubmit.addEventListener('click', onSubmit);
};

window.onload = init;
