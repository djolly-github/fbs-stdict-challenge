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
  filterWordRelatedCharacters: new RegExp(/[^(\w|\d|^\'|\u2019|\-)]/gm),
  notAlphaNumeric: new RegExp(/[^(\w|\d)]/gm)
};

/**
 * State of options flags
 */
const flags = {
  punctuation: true,
  capitalization: true,
}

/**
 * State of words data
 */
const stateData = {
  fetched: false,
  dictionaryWords: null,
  storyWords: null,
  story: null,
};

// State Functions

/**
 * Sets the current state of the options flags
 */
setFlags = () => {
  flags.capitalization = elements.optionsIncludeCapitalization.checked;
  flags.punctuation = elements.optionsIncludePunctuation.checked;
};

/**
 * Sets the current state data
 * @param {Array<string>} data The data string array to store
 * @returns The stateData object (to retain Promise structure)
 */
setData = (data) => {
  stateData.dictionaryWords = splitAndTrim(data[0], regex.filterWhitespace);
  stateData.storyWords = splitAndTrim(data[1], new RegExp(regex.filterWhitespace.source + '|' + regex.filterWordRelatedCharacters.source));
  stateData.story = data[1];
  stateData.fetched = true;
  return stateData;
}

// Event Handlers

/**
 * Handler for options submit button
 * @param {Event} e Event data
 */
const onSubmit = (e) => {
  e.preventDefault();
  resetBodyElements();
  setFlags();
  if (stateData.fetched === false) {
    getTextData()
      .then(parseTextData)
      .then(resolveParsedTextData)
  }
  else {
    resolveParsedTextData(stateData);
  }
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
