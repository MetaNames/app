

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.4d4638f3.js","_app/immutable/chunks/scheduler.8db5ed02.js","_app/immutable/chunks/index.45923e3e.js","_app/immutable/chunks/ActionIcons.6db25702.js","_app/immutable/chunks/stores.f2d76d56.js","_app/immutable/chunks/index.52378d56.js","_app/immutable/chunks/classAdderBuilder.915bbbff.js","_app/immutable/chunks/CircularProgress.7c3ed33e.js","_app/immutable/chunks/IconButton.279e6363.js"];
export const stylesheets = ["_app/immutable/assets/2.3917f653.css"];
export const fonts = [];
