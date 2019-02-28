const supertest = require('supertest');
const assert = require('assert');

const db = require("../db");
const models = require("../models");
const app = require('../app');
const _ = require("../routes");

beforeEach(async function () {
    await db.sync({ force: true }).then(async value => {
        const personWithoutGroup = await models.Person.create({
            id: 1,
            firstname: "John",
            lastname: "Doe"
        });

        const personWithGroup = await models.Person.create({
            id: 2,
            firstname: "Miss",
            lastname: "Da Two"
        });

        const groupWithPersons = await models.Group.create({
            id: 1,
            title: "group_1"
        });

        const emptyGroup = await models.Group.create({
            id: 2,
            title: "group_2"
        });

        await groupWithPersons.addPerson(personWithGroup);
    })
});

exports.get_inexisting_person_groups_returns_404 = function(done) {
    supertest(app)
        .get('/persons/555/groups')
        .expect(404)
        .expect("Content-Type", /^application\/json/)
        .end(function(err, response){
            assert.ifError(err);

            const body = JSON.parse(response.text);
            assert.strictEqual(body['error']['status'], 404);

            return done();
        });
};

exports.get_existing_person_groups_returns_valid = function(done) {
    supertest(app)
        .get('/persons/2/groups')
        .expect(200)
        .expect("Content-Type", /^application\/json/)
        .end(function(err, response){
            assert.ifError(err);

            const body = JSON.parse(response.text);
            assert.strictEqual(body.length, 1);

            const group = body[0];
            assert.strictEqual(group["id"], 1);
            assert.strictEqual(group["title"], "group_1");

            return done();
        });
};
