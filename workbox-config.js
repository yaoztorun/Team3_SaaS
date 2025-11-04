module.exports = {
	globDirectory: 'dist/',
	globPatterns: [
		'**/*.{js,ico,html,json}'
	],
	swDest: 'dist/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};