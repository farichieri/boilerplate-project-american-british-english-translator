const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require('./american-to-british-titles.js');
const britishOnly = require('./british-only.js');

class Translator {
  validTranslations = ['british-to-american', 'american-to-british'];

  translateToBritish = (word, library) => {
    let result = library[word.toLowerCase()]
      ? library[word.toLowerCase()]
      : false;
    if (library === americanToBritishTitles && result) {
      result = result.charAt(0).toUpperCase() + result.slice(1);
    }
    return result;
  };

  translateToAmerican = (word, library) => {
    let result;

    if (
      library === americanToBritishSpelling ||
      library === americanToBritishTitles
    ) {
      result =
        Object.keys(library).find(
          (key) => library[key] === word.toLowerCase()
        ) || false;
    } else {
      result = library[word.toLowerCase()]
        ? library[word.toLowerCase()]
        : false;
    }

    if (library === americanToBritishTitles && result) {
      result = result.charAt(0).toUpperCase() + result.slice(1);
    }
    return result;
  };

  translateTime = (string) => {
    const americanRegex = /^(([0-1]{0,1}[0-9])|(2[0-3])):[0-5]{0,1}[0-9]$/;
    const britishRegex = /^(([0-1]{0,1}[0-9])|(2[0-3]))\.[0-5]{0,1}[0-9]$/;
    if (americanRegex.test(string)) {
      return string.replace(':', '.');
    } else if (britishRegex.test(string)) {
      return string.replace('.', ':');
    } else {
      return false;
    }
  };

  evaluate = (text, locale) => {
    switch (locale) {
      case 'american-to-british': {
        return (
          this.translateToBritish(text, americanToBritishSpelling) ||
          this.translateToBritish(text, americanOnly) ||
          this.translateToBritish(text, americanToBritishTitles) ||
          this.translateTime(text) ||
          false
        );
      }
      case 'british-to-american': {
        return (
          this.translateToAmerican(text, americanToBritishSpelling) ||
          this.translateToAmerican(text, britishOnly) ||
          this.translateToAmerican(text, americanToBritishTitles) ||
          this.translateTime(text) ||
          false
        );
      }
      default: {
        return text;
      }
    }
  };

  highlight = (string) => {
    return string ? `<span class='highlight'>${string}</span>` : false;
  };

  translate = ({ text, locale }) => {
    // const americanToBritish = this.validTranslations[1];
    // const britishToAmerican = this.validTranslations[0];
    // const localeSelected = () => {
    //   return locale === americanToBritish
    //     ? americanToBritish
    //     : britishToAmerican
    //     ? britishToAmerican
    //     : null;
    // };

    // let arrayOfStrings;
    // if (localeSelected() === americanToBritish) {
    //   arrayOfStrings = text.replace(':', '.').split(' ');
    // } else if (localeSelected() === britishToAmerican) {
    //   arrayOfStrings = text.split(' ');
    // }

    let arrayOfStrings = text.split(' ');

    const lastString = arrayOfStrings[arrayOfStrings.length - 1];
    let lastLetter = lastString[lastString.length - 1];

    if (lastLetter === '.' || lastLetter === '?' || lastLetter === '!') {
      arrayOfStrings[arrayOfStrings.length - 1] = lastString
        .substring(0, lastString.length - 1)
        .replace('.', ':');
    } else {
      lastLetter = '';
    }

    let indexes = Array.from({ length: arrayOfStrings.length }, (_, i) => i);
    const result = [];
    arrayOfStrings.forEach((text, index) => {
      let evaluateString = text;

      if (indexes[index + 2] > 1 && indexes[index + 1] > 1) {
        evaluateString =
          text +
          ' ' +
          arrayOfStrings[index + 1] +
          ' ' +
          arrayOfStrings[index + 2];

        if (this.evaluate(evaluateString, locale)) {
          indexes[index + 2] = -1;
          indexes[index + 1] = -1;
          indexes[index] = -1;
          result.push(this.highlight(this.evaluate(evaluateString, locale)));
        }
      }
      if (indexes[index + 1] > 1) {
        evaluateString = text + ' ' + arrayOfStrings[index + 1];

        if (this.evaluate(evaluateString, locale)) {
          indexes[index + 1] = -1;
          result.push(this.highlight(this.evaluate(evaluateString, locale)));
        } else if (indexes[index] >= 0) {
          result.push(this.highlight(this.evaluate(text, locale)) || text);
        }
      } else if (indexes[index] >= 0) {
        result.push(this.highlight(this.evaluate(text, locale)) || text);
      }
    });

    let translation = result.join(' ') + lastLetter;
    if (translation === text) {
      translation = 'Everything looks good to me!';
    }

    return translation;
  };
}

module.exports = Translator;
