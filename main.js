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

const resolveBodyElements = () => {
  elements.dictionary = document.querySelector('#dictionary');
  elements.story = document.querySelector('#story');
  elements.words = document.querySelector('#words');
};

const getTextData = async () => {
  const requests = Object.values(requestURIs).map((uri) => fetch(uri, fetchParams));
  const responses = await Promise.all(requests);
  return responses;
}

const parseTextData = async (responses) => {
  const parsed = await Promise.all(responses.map((response) => response.text()));
  const splitText = parsed.map((text) => text.split('\n').filter((string) => string !== ''));
  return Promise.resolve(splitText);
}

const resolveParsedTextData = async (data) => {
  console.log(data)
  return Promise.resolve(data);
}

const init = () => {
  resolveBodyElements();
  getTextData()
    .then(parseTextData)
    .then(resolveParsedTextData)
};

window.onload = init;
