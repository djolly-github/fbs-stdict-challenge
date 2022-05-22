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
 * @param {string} stringA The string to compare with
 * @param {string} stringB The string to compare against
 * @returns Value between 0 (no match) and 1 (full match)
 */
const compareStrings = (stringA, stringB) => {
  // first determine if they are the exact same strings
  if (stringA === stringB) {
    return 1;
  }

  // determine larger length
  let larger = stringA;
  let smaller = stringB;
  if (stringB.length > stringA.length) {
    larger = stringB;
    smaller = stringA;
  }

  let divisor = larger.length;

  // split words by character
  const splitLarger = larger.split('');
  const splitSmaller = smaller.split('');

  // find any matching characters
  let matchingCharacters = 0;
  for (i = 0; i < splitLarger.length; i++) {
    // if both letters are the same, flag as matching character
    if (splitLarger[i] === splitSmaller[i]) {
      matchingCharacters++;
    }
    // otherwise find the closest character
    else {
      // the closest index of a character identical to the current character
      let closest = 0;
      // whether this found a character at all
      let found = false;
      for (j = 0; j < splitSmaller.length; j++) {
        // determine the distance between the next and previously tracked indices
        let distanceToCurrent = Math.abs(i - j);
        let distanceToPrevious = Math.abs(i - closest);
        // if the characters match and the current distance is less than the previous, track the new index
        if (splitLarger[i] === splitSmaller[j]
          && distanceToCurrent < distanceToPrevious) {
            closest = j;
            found = true;
          }
      }
      if (found) {
        matchingCharacters += 1 - (Math.abs(i - closest) / divisor)
      }
    }
  }

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
