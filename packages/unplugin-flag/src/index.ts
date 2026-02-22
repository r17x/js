import { createUnplugin } from "unplugin";
import { unpluginFactory } from "./core";

export { unpluginFactory };
/**
 * @example
 * ```js
 * import { Flag } from 'unplugin-flag'
 *
 * Flag({
 *    // ANY for NAME: BINARY_VALUE
 *    USER_PROFILE_V1: 'off',
 *    USER_PROFILE_V2: 'on',
 *    USER_PROFILE_V3: () => 'on',
 *    USER_PROFILE_V4: () => Promise.resolve('on'),
 * })
 *
 * ```
 */
export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory);
export default unplugin;
