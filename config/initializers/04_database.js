var neo4j = require('neo4j');

module.exports = function () {

	var db = new neo4j.GraphDatabase(
	    process.env['NEO4J_URL'] ||
	    process.env['GRAPHENEDB_URL'] ||
	    'http://tradie_db:41e36CCLMHA94Y3tfiDI/tradiedb.sb04.stations.graphenedb.com:24789/db/data/'
	);
};