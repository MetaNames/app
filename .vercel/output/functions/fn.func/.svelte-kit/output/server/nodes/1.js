

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.d6b2d18b.js","_app/immutable/chunks/scheduler.8db5ed02.js","_app/immutable/chunks/index.45923e3e.js","_app/immutable/chunks/stores.46af0b2d.js","_app/immutable/chunks/singletons.76d6b091.js","_app/immutable/chunks/index.52378d56.js"];
export const stylesheets = [];
export const fonts = [];
