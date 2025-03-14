"use client";
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/provider.tsx
var provider_exports = {};
__export(provider_exports, {
  default: () => CacheProvider
});
module.exports = __toCommonJS(provider_exports);

// src/modules/helpers.ts
function canUseDOM() {
  return !!(typeof window !== "undefined" && window.document?.createElement);
}

// src/provider.tsx
function CacheProvider({ children, name }) {
  if (canUseDOM()) {
    window.REACT_INLINESVG_CACHE_NAME = name;
    window.REACT_INLINESVG_PERSISTENT_CACHE = true;
  }
  return children;
}
//# sourceMappingURL=provider.js.map
// fix-cjs-exports
if (module.exports.default) {
  Object.assign(module.exports.default, module.exports);
  module.exports = module.exports.default;
  delete module.exports.default;
}
