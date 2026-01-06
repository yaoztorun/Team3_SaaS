module.exports = {
	globDirectory: 'dist/',
	globPatterns: [
		'**/*.{ico,html,json,png,svg}',
		// Exclude large JS/CSS files from precaching
		'!**/*.js',
		'!**/*.css'
	],
	swSrc: 'public/sw.js',
	swDest: 'dist/sw.js',
	// Increase file size limit for large bundles
	maximumFileSizeToCacheInBytes: 10 * 1024 * 1024 // 10 MB
};