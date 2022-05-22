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
  return setData(parsed);
};

/**
 * Utilizes retrieved text data in the app
 * @param {Array<string>} data The string data to work with
 * @returns data turned into Promise
 */
const resolveParsedTextData = async (data) => {
  // iterate over the story words by finding the best match
  const matchedWords = data.storyWords.map((word) => ({
    word,
    match: determineBestMatch(word, data.dictionaryWords),
  }));

  displayParsedTextData(data.dictionaryWords, data.story);
  displayClosestMatches(matchedWords);

  return Promise.resolve(data);
};
