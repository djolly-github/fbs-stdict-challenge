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

const determineMatch = (word, dictionary) => {
  if (dictionary.includes(word)) {
    return 1;
  }

  else {
    return 0;
  }
}

const filterWordsNotPresent = (words, dictionary) => {
  const mapped = words.map((word) => ({
    word,
    match: determineMatch(word, dictionary),
  }));
  mapped.forEach((value) => {
    if (value.match < 1) {
      const listElement = document.createElement('li');
      listElement.innerHTML = value.word;
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
