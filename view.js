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
};

/**
 * Modifies the UI to display words not present in the dictionary
 * @param {Array<string>} matchedWords The word match data array
 */
const displayClosestMatches = (matchedWords) => {
  // Make a table cell for each matched word
  matchedWords.forEach((word) => {
    // Only include words with less than 100% match value
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
};
