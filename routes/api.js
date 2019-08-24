/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
require('dotenv').config();
const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function(app) {

    app.route('/api/issues/:project')

    .get(function(req, res) {
        const project = req.params.project;
        if (req.query._id) {
            req.query._id = new ObjectId(req.query._id);
        }
        if (req.query.open) {
            if (req.query.open === 'true') {
                req.query.open = true;
            } else if (req.query.open === 'false') {
                req.query.open = false;
            }
        }
        MongoClient.connect(CONNECTION_STRING, (err, db) => {
            if (err) {
                res.json('Database error: ' + err);
            }
            db.collection(project).find(req.query).toArray((err, data) => {
                if (err) {
                    res.json('Error find: ' + err);
                }
                res.json(data);
            })
        });
    })

    .post(function(req, res) {
        if (!req.body['issue_title'] || !req.body['issue_text'] || !req.body['created_by']) {
            res.json({ Error: 'Missing required inputs' });
        } else {
            const project = {
                issue_title: req.body['issue_title'],
                issue_text: req.body['issue_text'],
                created_on: new Date(),
                updated_on: new Date(),
                created_by: req.body['created_by'],
                assigned_to: req.body['assigned_to'] || '',
                open: true,
                status_text: req.body['status_text'] || ''
            }
            MongoClient.connect(CONNECTION_STRING, (err, db) => {
                if (err) {
                    res.json('Database error: ' + err);
                }
                db.collection(req.params.project).insertOne(project, (err, data) => {
                    if (err) {
                        res.json({ Error: 'Erro to save this project' });
                    }
                    res.json(project);
                })
            })
        }
    })

    .put(function(req, res) {
        if (!req.body['issue_title'] && !req.body['issue_text'] && !req.body['created_by'] && !req.body['assigned_to'] && !req.body['open'] && !req.body['status_text']) {
            res.json({ Error: 'No updated field sent' });
        } else if (!req.body['_id']) {
            res.json({ Error: 'No updated field sent' });
        } else {
            MongoClient.connect(CONNECTION_STRING, (err, db) => {
                if (err) {
                    res.json({ Error: 'databese erro :  ' + err });
                }
                db.collection(req.params.project).findOne(ObjectId(req.body['_id']), (err, data) => {
                    if (err) {
                        res.json({ Error: 'could not update ' + req.body['_id'] });
                    }
                    let open = data.open
                    if (req.body['open'] === 'false') {
                        open = false
                    }
                    const project = {
                        issue_title: req.body['issue_title'] || data.issue_title,
                        issue_text: req.body['issue_text'] || data.issue_text,
                        updated_on: new Date(),
                        created_by: req.body['created_by'] || data.created_by,
                        assigned_to: req.body['assigned_to'] || data.assigned_to,
                        open: open,
                        status_text: req.body['status_text'] || data.status_text,
                    };
                    db.collection(req.params.project).updateOne({ _id: ObjectId(req.body['_id']) }, { $set: project }, (err, dataU) => {
                        if (err) {
                            res.json({ Error: 'could not update ' + req.body['_id'] });
                        }
                        res.json({ success: 'successfully updated' });
                    })
                })
            })
        }

    })

    .delete(function(req, res) {
        if (!req.body['_id']) {
            res.json({ Error: '_id error' });
        } else {
            MongoClient.connect(CONNECTION_STRING, (err, db) => {
                if (err) {
                    res.json('Database error: ' + err);
                }
                db.collection(req.params.project).findOne(ObjectId(req.body['_id']), (err, data) => {
                    if (err) {
                        res.json({ Error: 'could not delete' + req.body['_id'] });
                    }
                    db.collection(req.params.project).deleteOne({ _id: ObjectId(req.body['_id']) }, (err, data) => {
                        if (err) {
                            res.json({ Error: 'could not delete' + req.body['_id'] });
                        }
                        res.json({ success: 'deleted ' + req.body['_id'] });
                    })
                })
            })
        }
    });

};