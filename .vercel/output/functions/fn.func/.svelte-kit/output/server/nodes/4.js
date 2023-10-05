

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/profile/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/4.f34c6f42.js","_app/immutable/chunks/scheduler.8db5ed02.js","_app/immutable/chunks/index.45923e3e.js","_app/immutable/chunks/CircularProgress.7c3ed33e.js","_app/immutable/chunks/stores.f2d76d56.js","_app/immutable/chunks/index.52378d56.js","_app/immutable/chunks/Subtitle.660c0277.js"];
export const stylesheets = ["_app/immutable/assets/4.4f3f38c8.css"];
export const fonts = [];
