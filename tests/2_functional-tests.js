const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server.js');
const { expect } = require('chai');

chai.use(chaiHttp);

suite('Functional Tests', () => {
  test('1.Translation with text and locale fields: POST request to /api/translate', (done) => {
    chai
      .request(server)
      .post('/api/translate')
      .send({
        locale: 'british-to-american',
        text: 'We watched the footie match for a while.',
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        assert.equal(res.body.text, 'We watched the footie match for a while.');
        assert.equal(
          res.body.translation,
          `We watched the <span class='highlight'>soccer</span> match for a while.`
        );
        done();
      });
  });

  test('2.Translation with text and invalid locale field: POST request to /api/translate', (done) => {
    chai
      .request(server)
      .post('/api/translate')
      .send({
        locale: 'british-to-american-tobacco',
        text: 'Paracetamol takes up to an hour to work.',
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        assert.equal(res.body.error, 'Invalid value for locale field');
        done();
      });
  });

  test('3.Translation with missing text field: POST request to /api/translate', (done) => {
    chai
      .request(server)
      .post('/api/translate')
      .send({
        locale: 'british-to-american',
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        assert.equal(res.body.error, 'Required field(s) missing');
        done();
      });
  });

  test('4.Translation with missing locale field: POST request to /api/translate', (done) => {
    chai
      .request(server)
      .post('/api/translate')
      .send({
        text: 'Paracetamol takes up to an hour to work.',
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        assert.equal(res.body.error, 'Required field(s) missing');
        done();
      });
  });

  test('5.Translation with empty text: POST request to /api/translate', (done) => {
    chai
      .request(server)
      .post('/api/translate')
      .send({
        locale: 'british-to-american',
        text: '',
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        assert.equal(res.body.error, 'No text to translate');
        done();
      });
  });

  test('6.Translation with text that needs no translation: POST request to /api/translate', (done) => {
    chai
      .request(server)
      .post('/api/translate')
      .send({
        locale: 'british-to-american',
        text: 'To play hooky means to skip class or work.',
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        assert.equal(
          res.body.text,
          'To play hooky means to skip class or work.'
        );
        assert.equal(res.body.translation, 'Everything looks good to me!');
        done();
      });
  });
});
