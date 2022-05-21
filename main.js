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
  whitespace: new RegExp(/\n|\s/gm),
  punctuation: new RegExp(/[^(\w|\d|^\'|\u2019)]/gm),
};

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
 * @param {string} word The string to compare with
 * @param {string} other The string to compare against
 * @returns Value between 0 (no match) and 1 (full match)
 */
const stringComparison = (word, other) => {
  let divisor = other.length;
  if (word.length > other.length) {
    divisor = word.length;
  }

  const wordSplit = word.split('');
  const otherSplit = other.split('');

  let matchingCharacters = 0;
  wordSplit.forEach((character) => {
    if (otherSplit.includes(character)) {
      matchingCharacters++;
    }
  });

  return matchingCharacters / divisor;
};

/**
 * 
 * @param {string} word The word to find the closest match in the dictionary for
 * @param {Array<string>} dictionary The dictionary to search for matches in
 * @returns Object containing 'value' (of type number, the % matching) and 'word' (of type string, the best match)
 */
const determineMatch = (word, dictionary) => {
  if (dictionary.includes(word)) {
    return {
      value: 1,
      word,
    };
  }

  else {
    const matchValues = dictionary.map((dictionaryWord) => {
      return stringComparison(word, dictionaryWord)
    });
    let best = -1;
    let indexOfBest = -1;
    for (let i = 0; i < matchValues.length; i++) {
      if (matchValues[i] > best) {
        best = matchValues[i];
        indexOfBest = i;
      }
    }
    return {
      value: best,
      word: dictionary[indexOfBest]
    }
  }
};

/**
 * Finds words not present in the dictionary and displays their closest matches
 * @param {Array<string>} words The words to find matches for
 * @param {Array<string>} dictionary The words to find matches against
 */
const filterWordsNotPresent = (words, dictionary) => {
  const mappedWords = words.map((word) => ({
    word,
    match: determineMatch(word, dictionary),
  }));
  mappedWords.forEach((word) => {
    if (word.match.value < 1) {
      const listElement = document.createElement('tr');
      listElement.innerHTML = `<td>${word.word}</td><td>${word.match.word}</td><td>${(word.match.value * 100).toFixed(2)}</td>`;
      elements.words.appendChild(listElement);
    }
  });
};

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
  const dictionaryWords = splitAndTrim(data[0], regex.whitespace);
  dictionaryWords.forEach((string) => {
    const listElement = document.createElement('li');
    listElement.innerHTML = string;
    elements.dictionary.appendChild(listElement);
  });
  elements.story.innerHTML = data[1];
  const storyWords = splitAndTrim(data[1], new RegExp(regex.whitespace.source + '|' + regex.punctuation.source))
  filterWordsNotPresent(storyWords, dictionaryWords);
  return Promise.resolve(data);
};

/**
 * Handler for options submit button
 * @param {Event} e Event data
 */
const onSubmit = (e) => {
  e.preventDefault();
  resetBodyElements();
  getTextData()
    .then(parseTextData)
    .then(resolveParsedTextData)
}

/**
 * Entry point for the app, assigned to window.onload
 */
const init = () => {
  resolveBodyElements();
  elements.optionsSubmit.addEventListener('click', onSubmit);
};

window.onload = init;
