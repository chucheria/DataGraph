'use strict';

// simple express server
var express = require('express');
var app = express();
var router = express.Router();

// Neo4j backend
const neo4j = require('neo4j');
var db = new neo4j.GraphDatabase('http://neo4j:root@localhost:7474');


app.use(express.static('app'));
app.get('/', function(req, res) {
    res.sendfile('./app/index.html');
});

app.listen(5000);

app.get('/api/v1', (req, res) => {
    db.cypher({
        query: 'MATCH (k:Keyword)-[r]-(b) WHERE k.name = {name} RETURN b,r,k',
        params: {
            name: 'BIOLOGICAL CLASSIFICATION',
        },
    }, callback);

    function callback(err, results) {
        if (err) throw err;
        if (!results) {
            console.log('No node found.');
        } else {
            var nodes = [],
                links = [];

            Object.values(results).forEach(function(v){
                nodes.push({
                    id: v.b._id,
                    desc: v.b.properties.description,
                    title: v.b.properties.title,
                    idNASA: v.b.properties.id
                })

                links.push({
                    source: v.r._fromId,
                    target: v.r._toId,
                    type: v.r.type
                })
            });

            // Insert the node searched for which makes all relations
            var firstNode = Object.values(results)[0];
            nodes.push({
                id: firstNode.k._id,
                title: firstNode.k.name
            })

            var viz = {
                nodes: nodes,
                links: links
            }
            res.send(viz);
        }
    };
})
