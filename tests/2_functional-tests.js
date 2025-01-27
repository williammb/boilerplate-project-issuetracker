/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

    var idToUpdate;

    suite('POST /api/issues/{project} => object with issue data', function() {

        test('Every field filled in', function(done) {
            chai.request(server)
                .post('/api/issues/test')
                .send({
                    issue_title: 'Title',
                    issue_text: 'text',
                    created_by: 'Functional Test - Every field filled in',
                    assigned_to: 'Chai and Mocha',
                    status_text: 'In QA'
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.issue_title, 'Title');
                    assert.equal(res.body.issue_text, 'text');
                    assert.equal(res.body.created_by, 'Functional Test - Every field filled in');
                    assert.equal(res.body.assigned_to, 'Chai and Mocha');
                    assert.equal(res.body.status_text, 'In QA');
                    idToUpdate = res.body._id;
                    done();
                });
        });

        test('Required fields filled in', function(done) {
            chai.request(server)
                .post('/api/issues/test')
                .send({
                    issue_title: 'Title2',
                    issue_text: 'text2',
                    created_by: 'Functional Test - Every field filled in2',
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body['issue_title'], 'Title2');
                    assert.equal(res.body['issue_text'], 'text2');
                    assert.equal(res.body['created_by'], 'Functional Test - Every field filled in2');
                    assert.equal(res.body['assigned_to'], '');
                    assert.equal(res.body['status_text'], '');
                    done();
                });
        });

        test('Missing required fields', function(done) {
            chai.request(server)
                .post('/api/issues/test')
                .send({
                    issue_title: 'Title3',
                    created_by: 'Functional Test - Every field filled in',
                    assigned_to: 'Chai and Mocha',
                    status_text: 'In QA'
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body['Error'], 'Missing required inputs');
                    done();
                });
        });

    });

    suite('PUT /api/issues/{project} => text', function() {

        test('No body', function(done) {
            chai.request(server)
                .put('/api/issues/test')
                .send({})
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body['Error'], 'No updated field sent');
                    done();
                });
        });

        test('One field to update', function(done) {
            chai.request(server)
                .put('/api/issues/test')
                .send({
                    _id: idToUpdate,
                    open: 'false'
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body['success'], 'successfully updated');
                    done();
                });
        });

        test('Multiple fields to update', function(done) {
            chai.request(server)
                .put('/api/issues/test')
                .send({
                    _id: idToUpdate,
                    issue_title: 'ReTitle2',
                    created_by: 'Re do Functional Test - Every field filled in',
                    assigned_to: 'Re do Chai and Mocha',
                    status_text: 'Re do In QA'
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body['success'], 'successfully updated');
                    done();
                });
        });

    });

    suite('GET /api/issues/{project} => Array of objects with issue data', function() {

        test('No filter', function(done) {
            chai.request(server)
                .get('/api/issues/test')
                .query({})
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.property(res.body[0], 'issue_title');
                    assert.property(res.body[0], 'issue_text');
                    assert.property(res.body[0], 'created_on');
                    assert.property(res.body[0], 'updated_on');
                    assert.property(res.body[0], 'created_by');
                    assert.property(res.body[0], 'assigned_to');
                    assert.property(res.body[0], 'open');
                    assert.property(res.body[0], 'status_text');
                    assert.property(res.body[0], '_id');
                    done();
                });
        });

        test('One filter', function(done) {
            chai.request(server)
                .get('/api/issues/test?open=true')
                .query({})
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.property(res.body[0], 'issue_title');
                    assert.property(res.body[0], 'issue_text');
                    assert.property(res.body[0], 'created_on');
                    assert.property(res.body[0], 'updated_on');
                    assert.property(res.body[0], 'created_by');
                    assert.property(res.body[0], 'assigned_to');
                    assert.property(res.body[0], 'open');
                    assert.property(res.body[0], 'status_text');
                    assert.property(res.body[0], '_id');
                    done();
                });
        });

        test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
            chai.request(server)
                .get('/api/issues/test?open=true&issue_title=ReTitle2')
                .query({})
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.property(res.body[0], 'issue_title');
                    assert.property(res.body[0], 'issue_text');
                    assert.property(res.body[0], 'created_on');
                    assert.property(res.body[0], 'updated_on');
                    assert.property(res.body[0], 'created_by');
                    assert.property(res.body[0], 'assigned_to');
                    assert.property(res.body[0], 'open');
                    assert.property(res.body[0], 'status_text');
                    assert.property(res.body[0], '_id');
                    done();
                });
        });

    });

    suite('DELETE /api/issues/{project} => text', function() {

        test('No _id', function(done) {
            chai.request(server)
                .delete('/api/issues/test')
                .send({})
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body['Error'], '_id error');
                    done();
                });
        });

        test('Valid _id', function(done) {
            chai.request(server)
                .delete('/api/issues/test')
                .send({ _id: idToUpdate })
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body['success'], 'deleted ' + idToUpdate);
                    done();
                });
        });

    });

});