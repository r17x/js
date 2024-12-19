import { S } from "@mobily/ts-belt";

export const toJsonString = <T>(a: T) => JSON.stringify(a);
export const toUndefined = () => undefined;
export const toNull = () => null;
export const exclaim = S.startsWith("!");
export const dropHead = S.sliceToEnd(1);
