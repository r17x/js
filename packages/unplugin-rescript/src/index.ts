import { createUnplugin } from "unplugin";
import { unpluginFactory } from "./core";

export { unpluginFactory };
export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory);
export default unplugin;
