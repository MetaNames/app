import { _ as _global } from "./ssr.js";
import { Enviroment, MetaNamesSdk } from "@metanames/sdk";
import { w as writable, d as derived } from "./index.js";
const globals = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : (
  // @ts-ignore Node typings have this
  _global
);
const void_element_names = /^(?:area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/;
function is_void(name) {
  return void_element_names.test(name) || name.toLowerCase() === "!doctype";
}
const environment$1 = {}.VITE_ENV ?? "test";
const chainId = `Partisia Blockchain${environment$1 === "test" ? " Testnet" : ""}`;
const config = {
  chainId,
  environment: environment$1,
  dAppName: "Meta Names",
  permissions: ["sign"]
};
const environment = config.environment === "test" ? Enviroment.testnet : Enviroment.mainnet;
const metaNamesSdkFactory = () => new MetaNamesSdk(environment);
const metaNamesSdk = writable(metaNamesSdkFactory());
const walletAddress = writable();
const walletConnected = derived(walletAddress, ($walletAddress) => $walletAddress !== void 0);
export {
  walletConnected as a,
  globals as g,
  is_void as i,
  metaNamesSdk as m,
  walletAddress as w
};
