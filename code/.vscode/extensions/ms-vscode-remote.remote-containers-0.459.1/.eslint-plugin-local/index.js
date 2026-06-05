const fs = require('fs');
const path = require('path');

require('ts-node').register({ experimentalResolver: true, transpileOnly: true });

// Re-export all .ts files as rules
const rules = {};
fs.readdirSync(__dirname).filter(f => f.endsWith('.ts')).forEach((file) => {
	rules[path.basename(file, '.ts')] = require(path.join(__dirname, file));
});

exports.rules = rules;
