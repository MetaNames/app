export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png","images/logo.png","images/logo.svg","images/metamask.svg","images/partisia-wallet.svg","smui-dark.css","smui.css","~@fontsource/inter/500.css","~@fontsource/inter/700.css","~@fontsource/inter/900.css","~@fontsource/inter/index.css","~@fontsource/roboto/500.css","~@fontsource/roboto/700.css","~@fontsource/roboto/900.css","~@fontsource/roboto/index.css","~normalize.css/normalize.css"]),
	mimeTypes: {".png":"image/png",".svg":"image/svg+xml",".css":"text/css"},
	_: {
		client: {"start":"_app/immutable/entry/start.430ab842.js","app":"_app/immutable/entry/app.e711b5f1.js","imports":["_app/immutable/entry/start.430ab842.js","_app/immutable/chunks/scheduler.8db5ed02.js","_app/immutable/chunks/singletons.76d6b091.js","_app/immutable/chunks/index.52378d56.js","_app/immutable/entry/app.e711b5f1.js","_app/immutable/chunks/scheduler.8db5ed02.js","_app/immutable/chunks/index.45923e3e.js"],"stylesheets":[],"fonts":[]},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js')),
			__memo(() => import('../output/server/nodes/2.js')),
			__memo(() => import('../output/server/nodes/3.js')),
			__memo(() => import('../output/server/nodes/4.js')),
			__memo(() => import('../output/server/nodes/5.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/domain/[name]",
				pattern: /^\/domain\/([^/]+?)\/?$/,
				params: [{"name":"name","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/profile",
				pattern: /^\/profile\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/register/[name]",
				pattern: /^\/register\/([^/]+?)\/?$/,
				params: [{"name":"name","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
}
})();
