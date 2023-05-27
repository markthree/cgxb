import "./cutom.css";
import DefaultTheme from "vitepress/theme";

type EnhanceAppContext = Parameters<
  typeof DefaultTheme["enhanceApp"]
>[0];

export default {
  ...DefaultTheme,
  enhanceApp(ctx: EnhanceAppContext) {
    DefaultTheme.enhanceApp(ctx);
  },
};
