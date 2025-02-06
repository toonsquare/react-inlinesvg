import React, { SVGProps, ReactNode, RefObject } from 'react';

declare const STATUS: {
    readonly IDLE: "idle";
    readonly LOADING: "loading";
    readonly LOADED: "loaded";
    readonly FAILED: "failed";
    readonly READY: "ready";
    readonly UNSUPPORTED: "unsupported";
};

type ErrorCallback = (error: Error | FetchError) => void;
type LoadCallback = (src: string, isCached: boolean) => void;
type PlainObject<T = unknown> = Record<string, T>;
type PreProcessorCallback = (code: string) => string;
type Props = Simplify<Omit<SVGProps<SVGElement>, 'onLoad' | 'onError' | 'ref'> & {
    baseURL?: string;
    cacheRequests?: boolean;
    children?: ReactNode;
    description?: string;
    fetchOptions?: RequestInit;
    innerRef?: RefObject<SVGElement | null>;
    loader?: ReactNode;
    onError?: ErrorCallback;
    onLoad?: LoadCallback;
    preProcessor?: PreProcessorCallback;
    src: string;
    title?: string | null;
    uniqueHash?: string;
    uniquifyIDs?: boolean;
}>;
type Simplify<T> = {
    [KeyType in keyof T]: T[KeyType];
} & {};
type Status = (typeof STATUS)[keyof typeof STATUS];
interface FetchError extends Error {
    code: string;
    errno: string;
    message: string;
    type: string;
}
interface State {
    content: string;
    element: ReactNode;
    isCached: boolean;
    status: Status;
}
interface StorageItem {
    content: string;
    status: Status;
}

declare class CacheStore {
    private cacheApi;
    private readonly cacheStore;
    private readonly subscribers;
    isReady: boolean;
    constructor();
    onReady(callback: () => void): void;
    get(url: string, fetchOptions?: RequestInit): Promise<string>;
    set(url: string, data: StorageItem): void;
    isCached(url: string): boolean;
    private fetchAndAddToInternalCache;
    private fetchAndAddToPersistentCache;
    private handleLoading;
    keys(): Array<string>;
    data(): Array<Record<string, StorageItem>>;
    delete(url: string): Promise<void>;
    clear(): Promise<void>;
}

declare let cacheStore: CacheStore;
declare function InlineSVG(props: Props): string | number | boolean | Iterable<React.ReactNode> | React.JSX.Element | null | undefined;

export { type ErrorCallback, type FetchError, type LoadCallback, type PlainObject, type PreProcessorCallback, type Props, type Simplify, type State, type Status, type StorageItem, cacheStore, InlineSVG as default };
export = InlineSVG