module.exports = {
	globDirectory: 'dist/',
	globPatterns: [
		'**/*.{ico,html,json,png,svg}',
		// Exclude large JS/CSS files from precaching
		'!**/*.js',
		'!**/*.css'
	],
	swDest: 'dist/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	],
	// Skip waiting and claim clients immediately
	skipWaiting: true,
	clientsClaim: true,
	// Increase file size limit for large bundles
	maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB
	// Use Network First strategy for navigation requests
	runtimeCaching: [{
		// HTML pages - always try network first
		urlPattern: ({request}) => request.destination === 'document',
		handler: 'NetworkFirst',
		options: {
			cacheName: 'pages',
			networkTimeoutSeconds: 3,
		}
	}, {
		// JS and CSS bundles - cache with network fallback
		urlPattern: /\.(?:js|css)$/,
		handler: 'StaleWhileRevalidate',
		options: {
			cacheName: 'static-resources',
			expiration: {
				maxEntries: 60,
				maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
			},
		}
	}, {
		// Images and fonts
		urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|woff|woff2)$/,
		handler: 'CacheFirst',
		options: {
			cacheName: 'images-fonts',
			expiration: {
				maxEntries: 100,
				maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
			},
		}
	}]
};