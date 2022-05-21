const requestURIs = {
  dictionary: 'dictionary.txt',
  story: 'story.txt',
};

const elements = {
  dictionary: null,
  story: null,
  words: null
}

const fetchParams = {

};

const regex = {
  whitespace: new RegExp(/\n|\s/gm),
  punctuation: new RegExp(/[^(\w|\d|^\'|\u2019)]/gm),
};

const splitAndTrim = (str, regex) => {
  return str.trim().split(regex).filter((string) => string !== '')
};

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
}

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
}

const filterWordsNotPresent = (words, dictionary) => {
  const mappedWords = words.map((word) => ({
    word,
    match: determineMatch(word, dictionary),
  }));
  mappedWords.forEach((word) => {
    if (word.match.value < 1) {
      const listElement = document.createElement('li');
      listElement.innerHTML = `${word.word} : ${word.match.word} @ ${(word.match.value * 100).toFixed(2)}%`;
      elements.words.appendChild(listElement);
    }
  });
};

const resolveBodyElements = () => {
  elements.dictionary = document.querySelector('#dictionary ul');
  elements.story = document.querySelector('#story p');
  elements.words = document.querySelector('#words ul');
};

const getTextData = async () => {
  const requests = Object.values(requestURIs).map((uri) => fetch(uri, fetchParams));
  const responses = await Promise.all(requests);
  return responses;
}

const parseTextData = async (responses) => {
  const parsed = await Promise.all(responses.map((response) => response.text()));
  return parsed;
}

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
}

const init = () => {
  resolveBodyElements();
  getTextData()
    .then(parseTextData)
    .then(resolveParsedTextData)
};

window.onload = init;
