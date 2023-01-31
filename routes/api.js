'use strict';

const Translator = require('../components/translator.js');

module.exports = function (app) {
  const translator = new Translator();

  app.route('/api/translate').post((req, res) => {
    const { text, locale } = req.body;

    if (text === '') {
      return res.status(200).send({ error: 'No text to translate' });
    }

    if (!text || !locale) {
      return res.status(200).send({ error: 'Required field(s) missing' });
    }

    if (
      locale !== translator.locales.britishToAmerican &&
      locale !== translator.locales.americanToBritish
    ) {
      return res.status(200).send({ error: 'Invalid value for locale field' });
    }

    const translation = translator.translate({ text, locale });

    return res.status(200).send({ text: text, translation: translation });
  });
};
