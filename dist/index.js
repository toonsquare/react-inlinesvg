"use client";
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/index.tsx
var index_exports = {};
__export(index_exports, {
  cacheStore: () => cacheStore,
  default: () => InlineSVG
});
module.exports = __toCommonJS(index_exports);
var import_react2 = __toESM(require("react"));
var import_react_from_dom2 = __toESM(require("react-from-dom"));

// src/config.ts
var CACHE_NAME = "tooning-plus-ed-static";
var CACHE_MAX_RETRIES = 10;
var STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  LOADED: "loaded",
  FAILED: "failed",
  READY: "ready",
  UNSUPPORTED: "unsupported"
};

// src/modules/helpers.ts
function randomCharacter(character) {
  return character[Math.floor(Math.random() * character.length)];
}
function canUseDOM() {
  return !!(typeof window !== "undefined" && window.document?.createElement);
}
function isSupportedEnvironment() {
  return supportsInlineSVG() && typeof window !== "undefined" && window !== null;
}
function omit(input, ...filter) {
  const output = {};
  for (const key in input) {
    if ({}.hasOwnProperty.call(input, key)) {
      if (!filter.includes(key)) {
        output[key] = input[key];
      }
    }
  }
  return output;
}
function randomString(length) {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "1234567890";
  const charset = `${letters}${letters.toUpperCase()}${numbers}`;
  let R = "";
  for (let index = 0; index < length; index++) {
    R += randomCharacter(charset);
  }
  return R;
}
async function request(url, options) {
  const response = await fetch(url, options);
  const contentType = response.headers.get("content-type");
  const [fileType] = (contentType ?? "").split(/ ?; ?/);
  if (response.status > 299) {
    throw new Error("Not found");
  }
  if (!["image/svg+xml", "text/plain"].some((d) => fileType.includes(d))) {
    throw new Error(`Content type isn't valid: ${fileType}`);
  }
  return response.text();
}
function sleep(seconds = 1) {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1e3);
  });
}
function supportsInlineSVG() {
  if (!document) {
    return false;
  }
  const div = document.createElement("div");
  div.innerHTML = "<svg />";
  const svg = div.firstChild;
  return !!svg && svg.namespaceURI === "http://www.w3.org/2000/svg";
}

// src/modules/cache.ts
var CacheStore = class {
  constructor() {
    __publicField(this, "cacheApi");
    __publicField(this, "cacheStore");
    __publicField(this, "subscribers", []);
    __publicField(this, "isReady", false);
    this.cacheStore = /* @__PURE__ */ new Map();
    let cacheName = CACHE_NAME;
    let usePersistentCache = false;
    if (canUseDOM()) {
      cacheName = window.REACT_INLINESVG_CACHE_NAME ?? CACHE_NAME;
      usePersistentCache = !!window.REACT_INLINESVG_PERSISTENT_CACHE && "caches" in window;
    }
    if (usePersistentCache) {
      caches.open(cacheName).then((cache) => {
        this.cacheApi = cache;
      }).catch((error) => {
        console.error(`Failed to open cache: ${error.message}`);
      }).finally(() => {
        this.isReady = true;
        this.subscribers.forEach((callback) => callback());
      });
    } else {
      this.isReady = true;
    }
  }
  onReady(callback) {
    if (this.isReady) {
      callback();
    } else {
      this.subscribers.push(callback);
    }
  }
  async get(url, fetchOptions) {
    await (this.cacheApi ? this.fetchAndAddToPersistentCache(url, fetchOptions) : this.fetchAndAddToInternalCache(url, fetchOptions));
    return this.cacheStore.get(url)?.content ?? "";
  }
  set(url, data) {
    this.cacheStore.set(url, data);
  }
  isCached(url) {
    return this.cacheStore.get(url)?.status === STATUS.LOADED;
  }
  async fetchAndAddToInternalCache(url, fetchOptions) {
    const cache = this.cacheStore.get(url);
    if (cache?.status === STATUS.LOADING) {
      await this.handleLoading(url, async () => {
        this.cacheStore.set(url, { content: "", status: STATUS.IDLE });
        await this.fetchAndAddToInternalCache(url, fetchOptions);
      });
      return;
    }
    if (!cache?.content) {
      this.cacheStore.set(url, { content: "", status: STATUS.LOADING });
      try {
        const content = await request(url, fetchOptions);
        this.cacheStore.set(url, { content, status: STATUS.LOADED });
      } catch (error) {
        this.cacheStore.set(url, { content: "", status: STATUS.FAILED });
        throw error;
      }
    }
  }
  async fetchAndAddToPersistentCache(url, fetchOptions) {
    const cache = this.cacheStore.get(url);
    if (cache?.status === STATUS.LOADED) {
      return;
    }
    if (cache?.status === STATUS.LOADING) {
      await this.handleLoading(url, async () => {
        this.cacheStore.set(url, { content: "", status: STATUS.IDLE });
        await this.fetchAndAddToPersistentCache(url, fetchOptions);
      });
      return;
    }
    this.cacheStore.set(url, { content: "", status: STATUS.LOADING });
    const data = await this.cacheApi?.match(url);
    if (data) {
      const content = await data.text();
      this.cacheStore.set(url, { content, status: STATUS.LOADED });
      return;
    }
    try {
      await this.cacheApi?.add(new Request(url, fetchOptions));
      const response = await this.cacheApi?.match(url);
      const content = await response?.text() ?? "";
      this.cacheStore.set(url, { content, status: STATUS.LOADED });
    } catch (error) {
      this.cacheStore.set(url, { content: "", status: STATUS.FAILED });
      throw error;
    }
  }
  async handleLoading(url, callback) {
    let retryCount = 0;
    while (this.cacheStore.get(url)?.status === STATUS.LOADING && retryCount < CACHE_MAX_RETRIES) {
      await sleep(0.1);
      retryCount += 1;
    }
    if (retryCount >= CACHE_MAX_RETRIES) {
      await callback();
    }
  }
  keys() {
    return [...this.cacheStore.keys()];
  }
  data() {
    return [...this.cacheStore.entries()].map(([key, value]) => ({ [key]: value }));
  }
  async delete(url) {
    if (this.cacheApi) {
      await this.cacheApi.delete(url);
    }
    this.cacheStore.delete(url);
  }
  async clear() {
    if (this.cacheApi) {
      const keys = await this.cacheApi.keys();
      for (const key of keys) {
        await this.cacheApi.delete(key);
      }
    }
    this.cacheStore.clear();
  }
};

// src/modules/hooks.tsx
var import_react = require("react");
function usePrevious(state) {
  const ref = (0, import_react.useRef)(void 0);
  (0, import_react.useEffect)(() => {
    ref.current = state;
  });
  return ref.current;
}

// src/modules/utils.ts
var import_react_from_dom = __toESM(require("react-from-dom"));
function getNode(options) {
  const {
    baseURL,
    content,
    description,
    handleError,
    hash,
    preProcessor,
    title,
    uniquifyIDs = false
  } = options;
  try {
    const svgText = processSVG(content, preProcessor);
    const node = (0, import_react_from_dom.default)(svgText, { nodeOnly: true });
    if (!node || !(node instanceof SVGSVGElement)) {
      throw new Error("Could not convert the src to a DOM Node");
    }
    const svg = updateSVGAttributes(node, { baseURL, hash, uniquifyIDs });
    if (description) {
      const originalDesc = svg.querySelector("desc");
      if (originalDesc?.parentNode) {
        originalDesc.parentNode.removeChild(originalDesc);
      }
      const descElement = document.createElementNS("http://www.w3.org/2000/svg", "desc");
      descElement.innerHTML = description;
      svg.prepend(descElement);
    }
    if (typeof title !== "undefined") {
      const originalTitle = svg.querySelector("title");
      if (originalTitle?.parentNode) {
        originalTitle.parentNode.removeChild(originalTitle);
      }
      if (title) {
        const titleElement = document.createElementNS("http://www.w3.org/2000/svg", "title");
        titleElement.innerHTML = title;
        svg.prepend(titleElement);
      }
    }
    return svg;
  } catch (error) {
    return handleError(error);
  }
}
function processSVG(content, preProcessor) {
  if (preProcessor) {
    return preProcessor(content);
  }
  return content;
}
function updateSVGAttributes(node, options) {
  const { baseURL = "", hash, uniquifyIDs } = options;
  const replaceableAttributes = ["id", "href", "xlink:href", "xlink:role", "xlink:arcrole"];
  const linkAttributes = ["href", "xlink:href"];
  const isDataValue = (name, value) => linkAttributes.includes(name) && (value ? !value.includes("#") : false);
  if (!uniquifyIDs) {
    return node;
  }
  [...node.children].forEach((d) => {
    if (d.attributes?.length) {
      const attributes = Object.values(d.attributes).map((a) => {
        const attribute = a;
        const match = /url\((.*?)\)/.exec(a.value);
        if (match?.[1]) {
          attribute.value = a.value.replace(match[0], `url(${baseURL}${match[1]}__${hash})`);
        }
        return attribute;
      });
      replaceableAttributes.forEach((r) => {
        const attribute = attributes.find((a) => a.name === r);
        if (attribute && !isDataValue(r, attribute.value)) {
          attribute.value = `${attribute.value}__${hash}`;
        }
      });
    }
    if (d.children.length) {
      return updateSVGAttributes(d, options);
    }
    return d;
  });
  return node;
}

// src/index.tsx
var cacheStore;
function ReactInlineSVG(props) {
  const {
    cacheRequests = true,
    children = null,
    description,
    fetchOptions,
    innerRef,
    loader = null,
    onError,
    onLoad,
    src,
    title,
    uniqueHash
  } = props;
  const [state, setState] = (0, import_react2.useReducer)(
    (previousState2, nextState) => ({
      ...previousState2,
      ...nextState
    }),
    {
      content: "",
      element: null,
      isCached: cacheRequests && cacheStore.isCached(props.src),
      status: STATUS.IDLE
    }
  );
  const { content, element, isCached, status } = state;
  const previousProps = usePrevious(props);
  const previousState = usePrevious(state);
  const hash = (0, import_react2.useRef)(uniqueHash ?? randomString(8));
  const isActive = (0, import_react2.useRef)(false);
  const isInitialized = (0, import_react2.useRef)(false);
  const handleError = (0, import_react2.useCallback)(
    (error) => {
      if (isActive.current) {
        setState({
          status: error.message === "Browser does not support SVG" ? STATUS.UNSUPPORTED : STATUS.FAILED
        });
        onError?.(error);
      }
    },
    [onError]
  );
  const handleLoad = (0, import_react2.useCallback)((loadedContent, hasCache = false) => {
    if (isActive.current) {
      setState({
        content: loadedContent,
        isCached: hasCache,
        status: STATUS.LOADED
      });
    }
  }, []);
  const fetchContent = (0, import_react2.useCallback)(async () => {
    const responseContent = await request(src, fetchOptions);
    handleLoad(responseContent);
  }, [fetchOptions, handleLoad, src]);
  const getElement = (0, import_react2.useCallback)(() => {
    try {
      const node = getNode({ ...props, handleError, hash: hash.current, content });
      const convertedElement = (0, import_react_from_dom2.default)(node);
      if (!convertedElement || !(0, import_react2.isValidElement)(convertedElement)) {
        throw new Error("Could not convert the src to a React element");
      }
      setState({
        element: convertedElement,
        status: STATUS.READY
      });
    } catch (error) {
      handleError(new Error(error.message));
    }
  }, [content, handleError, props]);
  const getContent = (0, import_react2.useCallback)(async () => {
    const dataURI = /^data:image\/svg[^,]*?(;base64)?,(.*)/u.exec(src);
    let inlineSrc;
    if (dataURI) {
      inlineSrc = dataURI[1] ? window.atob(dataURI[2]) : decodeURIComponent(dataURI[2]);
    } else if (src.includes("<svg")) {
      inlineSrc = src;
    }
    if (inlineSrc) {
      handleLoad(inlineSrc);
      return;
    }
    try {
      if (cacheRequests) {
        const cachedContent = await cacheStore.get(src, fetchOptions);
        handleLoad(cachedContent, true);
      } else {
        await fetchContent();
      }
    } catch (error) {
      handleError(error);
    }
  }, [cacheRequests, fetchContent, fetchOptions, handleError, handleLoad, src]);
  const load = (0, import_react2.useCallback)(async () => {
    if (isActive.current) {
      setState({
        content: "",
        element: null,
        isCached: false,
        status: STATUS.LOADING
      });
    }
  }, []);
  (0, import_react2.useEffect)(
    () => {
      isActive.current = true;
      if (!canUseDOM() || isInitialized.current) {
        return () => void 0;
      }
      try {
        if (status === STATUS.IDLE) {
          if (!isSupportedEnvironment()) {
            throw new Error("Browser does not support SVG");
          }
          if (!src) {
            throw new Error("Missing src");
          }
          load();
        }
      } catch (error) {
        handleError(error);
      }
      isInitialized.current = true;
      return () => {
        isActive.current = false;
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  (0, import_react2.useEffect)(() => {
    if (!canUseDOM()) {
      return;
    }
    if (!previousProps) {
      return;
    }
    if (previousProps.src !== src) {
      if (!src) {
        handleError(new Error("Missing src"));
        return;
      }
      load();
    } else if (previousProps.title !== title || previousProps.description !== description) {
      getElement();
    }
  }, [description, getElement, handleError, load, previousProps, src, title]);
  (0, import_react2.useEffect)(() => {
    if (!previousState) {
      return;
    }
    if (previousState.status !== STATUS.LOADING && status === STATUS.LOADING) {
      getContent();
    }
    if (previousState.status !== STATUS.LOADED && status === STATUS.LOADED) {
      getElement();
    }
    if (previousState.status !== STATUS.READY && status === STATUS.READY) {
      onLoad?.(src, isCached);
    }
  }, [getContent, getElement, isCached, onLoad, previousState, src, status]);
  const elementProps = omit(
    props,
    "baseURL",
    "cacheRequests",
    "children",
    "description",
    "fetchOptions",
    "innerRef",
    "loader",
    "onError",
    "onLoad",
    "preProcessor",
    "src",
    "title",
    "uniqueHash",
    "uniquifyIDs"
  );
  if (!canUseDOM()) {
    return loader;
  }
  if (element) {
    return (0, import_react2.cloneElement)(element, {
      ref: innerRef,
      ...elementProps
    });
  }
  if ([STATUS.UNSUPPORTED, STATUS.FAILED].includes(status)) {
    return children;
  }
  return loader;
}
function InlineSVG(props) {
  if (!cacheStore) {
    cacheStore = new CacheStore();
  }
  const { loader } = props;
  const hasCallback = (0, import_react2.useRef)(false);
  const [isReady, setReady] = (0, import_react2.useState)(cacheStore.isReady);
  (0, import_react2.useEffect)(() => {
    if (!hasCallback.current) {
      cacheStore.onReady(() => {
        setReady(true);
      });
      hasCallback.current = true;
    }
  }, []);
  if (!isReady) {
    return loader;
  }
  return /* @__PURE__ */ import_react2.default.createElement(ReactInlineSVG, { ...props });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  cacheStore
});
//# sourceMappingURL=index.js.map
// fix-cjs-exports
if (module.exports.default) {
  Object.assign(module.exports.default, module.exports);
  module.exports = module.exports.default;
  delete module.exports.default;
}
