"use client";

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
export {
  CacheProvider as default
};
//# sourceMappingURL=provider.mjs.map