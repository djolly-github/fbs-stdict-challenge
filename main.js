const init = () => {
  const uriDictionary = 'dictionary.txt'
  const uriStory = 'story.txt'

  const elementDictionary = document.querySelector('#dictionary');
  const elementStory = document.querySelector('#story');

  Promise.all([uriDictionary, uriStory].map((uri) => fetch(uri)))
    .then((responses) => {
      console.log(responses.map((response) => response.text()));
    });
};

window.onload = init;
