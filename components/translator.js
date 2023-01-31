const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require('./american-to-british-titles.js');
const britishOnly = require('./british-only.js');

class Translator {
  locales = {
    britishToAmerican: 'british-to-american',
    americanToBritish: 'american-to-british',
  };

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

  translateTime = (string, locale) => {
    const americanRegex = /^(([0-1]{0,1}[0-9])|(2[0-3]))\:[0-5]{0,1}[0-9]$/;
    const britishRegex = /^(([0-1]{0,1}[0-9])|(2[0-3]))\.[0-5]{0,1}[0-9]$/;
    if (
      locale === this.locales.americanToBritish &&
      americanRegex.test(string)
    ) {
      return string.replace(':', '.');
    } else if (
      locale === this.locales.britishToAmerican &&
      britishRegex.test(string)
    ) {
      return string.replace('.', ':');
    } else {
      return false;
    }
  };

  evaluate = (text, locale) => {
    switch (locale) {
      case this.locales.americanToBritish: {
        return (
          this.translateToBritish(text, americanToBritishSpelling) ||
          this.translateToBritish(text, americanOnly) ||
          this.translateToBritish(text, americanToBritishTitles) ||
          this.translateTime(text, this.locales.americanToBritish) ||
          false
        );
      }
      case this.locales.britishToAmerican: {
        return (
          this.translateToAmerican(text, americanToBritishSpelling) ||
          this.translateToAmerican(text, britishOnly) ||
          this.translateToAmerican(text, americanToBritishTitles) ||
          this.translateTime(text, this.locales.britishToAmerican) ||
          false
        );
      }
      default: {
        return text;
      }
    }
  };

  translate = ({ text, locale }) => {
    let arrayOfStrings = text.split(' ');
    let translated = false;

    const highlight = (string) => {
      if (string) {
        translated = true;
        return `<span class="highlight">${string}</span>`;
      } else {
        return false;
      }
    };

    const lastString = arrayOfStrings[arrayOfStrings.length - 1];
    let lastLetter = lastString[lastString.length - 1];

    if (lastLetter === '.' || lastLetter === '?' || lastLetter === '!') {
      arrayOfStrings[arrayOfStrings.length - 1] = lastString.substring(
        0,
        lastString.length - 1
      );
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
          result.push(highlight(this.evaluate(evaluateString, locale)));
        }
      }
      if (indexes[index + 1] > 1) {
        evaluateString = text + ' ' + arrayOfStrings[index + 1];

        if (this.evaluate(evaluateString, locale)) {
          indexes[index + 1] = -1;
          result.push(highlight(this.evaluate(evaluateString, locale)));
        } else if (indexes[index] >= 0) {
          result.push(highlight(this.evaluate(text, locale)) || text);
        }
      } else if (indexes[index] >= 0) {
        result.push(highlight(this.evaluate(text, locale)) || text);
      }
    });

    let translation = result.join(' ') + lastLetter;
    if (!translated) {
      translation = 'Everything looks good to me!';
    }

    return translation;
  };
}

module.exports = Translator;
