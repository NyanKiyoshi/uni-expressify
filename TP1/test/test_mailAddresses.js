const suite = require("./suite");

const supertest = require('supertest');
const assert = require('assert');

const db = require("../db");
const models = require("../models");
const app = require('../app');
const _ = require("../routes");

exports.inexisting_should_person_return_404 = function(done) {
    supertest(app)
        .get('/persons/555/mailAddresses')
        .set(suite.jwt.Headers)
        .expect(404)
        .expect("Content-Type", /^application\/json/)
        .end(function(err, response) {
            assert.ifError(err);

            const body = JSON.parse(response.text);
            assert.strictEqual(body['error']['status'], 404);

            return done();
        });
};

exports.person_without_mail_address_should_return_empty = function(done) {
    supertest(app)
        .get('/persons/1/mailAddresses')
        .set(suite.jwt.Headers)
        .expect(200)
        .expect("Content-Type", /^application\/json/)
        .end(function(err, response) {
            assert.ifError(err);

            const body = JSON.parse(response.text);

            assert.strictEqual(typeof body, typeof []);
            assert.strictEqual(body.length, 0);

            return done();
        });
};

exports.person_with_mail_address_should_not_return_empty = function(done) {
    supertest(app)
        .get('/persons/2/mailAddresses')
        .set(suite.jwt.Headers)
        .expect(200)
        .expect("Content-Type", /^application\/json/)
        .end(function(err, response) {
            assert.ifError(err);

            const body = JSON.parse(response.text);

            assert.strictEqual(typeof body, typeof []);
            assert.strictEqual(body.length, 1);

            const data = body[0];
            assert.strictEqual(data["type"], "work");
            assert.strictEqual(data["address"], "miss@example.com");

            return done();
        });
};

exports.filter_email_numbers_valid_return = function(done) {
    supertest(app)
        .get('/persons/2/mailAddresses?type=work')
        .set(suite.jwt.Headers)
        .expect(200)
        .expect("Content-Type", /^application\/json/)
        .end(function(err, response) {
            assert.ifError(err);

            const body = JSON.parse(response.text);

            assert.strictEqual(typeof body, typeof []);
            assert.strictEqual(body.length, 1);

            return done();
        });
};

exports.filter_email_numbers_valid_return = function(done) {
    supertest(app)
        .get('/persons/2/mailAddresses?type=home')
        .set(suite.jwt.Headers)
        .expect(200)
        .expect("Content-Type", /^application\/json/)
        .end(function(err, response) {
            assert.ifError(err);

            const body = JSON.parse(response.text);

            assert.strictEqual(typeof body, typeof []);
            assert.strictEqual(body.length, 0);

            return done();
        });
};

exports.get_inexisting_address = function(done) {
    supertest(app)
        .get('/persons/2/mailAddresses/12')
        .set(suite.jwt.Headers)
        .expect(404)
        .expect("Content-Type", /^application\/json/)
        .end(function(err, response) {
            assert.ifError(err);

            const body = JSON.parse(response.text);
            assert.strictEqual(body['error']['status'], 404);

            return done();
        });
};

exports.get_existing_address = function(done) {
    supertest(app)
        .get('/persons/2/mailAddresses/1')
        .set(suite.jwt.Headers)
        .expect(200)
        .expect("Content-Type", /^application\/json/)
        .end(function(err, response) {
            assert.ifError(err);

            const body = JSON.parse(response.text);
            assert.strictEqual(body["type"], "work");
            assert.strictEqual(body["address"], "miss@example.com");

            return done();
        });
};

exports.create_new_email_number = function(done) {
    supertest(app)
        .post('/persons/2/mailAddresses')
        .set(suite.jwt.Headers)
        .send({"type": "work", "address": "miss3@example.com"})
        .expect(201)
        .end(async function (err, response) {
            assert.ifError(err);

            const body = JSON.parse(response.text);

            assert.strictEqual(body["PersonId"], "2");
            assert.strictEqual(body["type"], "work");
            assert.strictEqual(body["address"], "miss3@example.com");

            return done();
        });
};

exports.update_inexisting_address = function(done) {
    supertest(app)
        .put('/persons/2/mailAddresses/12')
        .set(suite.jwt.Headers)
        .send({"type": "home", "address": "miss2@example.com"})
        .expect(404)
        .expect("Content-Type", /^application\/json/)
        .end(function(err, response) {
            assert.ifError(err);

            const body = JSON.parse(response.text);
            assert.strictEqual(body['error']['status'], 404);

            return done();
        });
};

exports.update_existing_address = function(done) {
    supertest(app)
        .put('/persons/2/mailAddresses/1')
        .set(suite.jwt.Headers)
        .send({"type": "home", "address": "miss2@example.com"})
        .expect(200)
        .end(async function (err, response) {
            assert.ifError(err);

            const body = JSON.parse(response.text);
            assert.strictEqual(body["id"], 1);
            assert.strictEqual(body["PersonId"], 2);
            assert.strictEqual(body["type"], "home");
            assert.strictEqual(body["address"], "miss2@example.com");

            return done();
        });
};

exports.delete_inexisting_address = function(done) {
    supertest(app)
        .delete('/persons/2/mailAddresses/12')
        .set(suite.jwt.Headers)
        .expect(404)
        .expect("Content-Type", /^application\/json/)
        .end(function(err, response) {
            assert.ifError(err);

            const body = JSON.parse(response.text);
            assert.strictEqual(body['error']['status'], 404);

            return done();
        });
};

exports.delete_existing_address = function(done) {
    supertest(app)
        .delete('/persons/2/mailAddresses/1')
        .set(suite.jwt.Headers)
        .expect(204)
        .end(async function (err, response) {
            assert.ifError(err);

            await models.MailAddress.findByPk(1).then(value => {
                assert.ok(!value);
            });

            return done();
        });
};
