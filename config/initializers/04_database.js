var neo4j = require('neo4j');

module.exports = function () {

	var db = new neo4j.GraphDatabase(
	    process.env['NEO4J_URL'] ||
	    process.env['GRAPHENEDB_URL'] ||
	    'http://localhost:7474'
	);
};