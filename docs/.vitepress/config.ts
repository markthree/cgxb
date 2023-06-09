import fg from "fast-glob";
import { defineConfig } from "vitepress";
import { description } from "../../package.json";

import type { DefaultTheme } from "vitepress";
import { readFile, writeFile } from "fs/promises";

export default defineConfig({
  lang: "zh-CN",
  title: "吃瓜小报",
  description,
  lastUpdated: true,
  head: [["link", { rel: "icon", href: "/favicon.png" }]],
  themeConfig: {
    search: {
      provider: "local",
    },
    logo: "logo.svg",
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2023 markthree",
    },
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/markthree/cgxb",
      },
    ],
    editLink: {
      pattern: "https://github.com/markthree/cgxb/edit/main/docs/:path",
      text: "在 GitHub 上编辑此页",
    },
  },
  vite: {
    plugins: [{
      name: "vite-plugin-auto-gen",
      async config(config) {
        const themeConfig: DefaultTheme.Config =
          // @ts-ignore
          config.vitepress.site.themeConfig;
        const records = await fg("*/*/*.md", {
          cwd: "./docs",
          onlyFiles: true,
        });

        const nav = themeConfig.nav = [{
          text: "更新日志",
          link: "https://github.com/markthree/cgxb/blob/main/CHANGELOG.md",
        }] as DefaultTheme.NavItem[];

        const sidebar = (themeConfig.sidebar = {}) as DefaultTheme.SidebarMulti;

        let recentLink: string | undefined;
        const reg = /(.*?)\/(.*?)\/(.*)\.md/;

        for (const record of records) {
          const [_, year, month, day] = record.match(reg) as string[];
          const yearItem = {
            text: year,
            link: `/${year}/`,
          };
          const monthItem = {
            text: `${month}月`,
            link: `${yearItem.link}${month}/`,
          };

          const dayItem = {
            text: `${day}日`,
            link: `${monthItem.link}${day}`,
          };
          let oldYearNav = nav.find((n) => n.text === yearItem.text);

          // 不存在 nav
          if (!oldYearNav) {
            oldYearNav = {
              text: yearItem.text,
              link: dayItem.link,
            };
            nav.unshift(oldYearNav);
          }

          // 重定向
          (oldYearNav as DefaultTheme.NavItemWithLink).link =
            recentLink =
              dayItem.link;

          if (!sidebar[yearItem.link]) {
            sidebar[yearItem.link] = [{
              text: yearItem.text,
              items: [{
                text: monthItem.text,
                items: [dayItem],
              }],
            }];
            continue;
          }

          const monthSiderBarItems = sidebar[yearItem.link][0].items;

          const monthSideBar = monthSiderBarItems!.find((m) =>
            m.text === monthItem.text
          );

          if (!monthSideBar) {
            monthSiderBarItems?.unshift({
              text: monthItem.text,
              items: [dayItem],
            });
            continue;
          }

          const hasDayItem = monthSideBar.items?.some((d) =>
            d.text === dayItem.text
          );
          if (!hasDayItem) {
            monthSideBar.items?.unshift(dayItem);
          }
        }

        if (recentLink) {
          const homePageFile = "docs/index.md";

          const homePageMD = await readFile(homePageFile, {
            encoding: "utf-8",
          });

          await writeFile(
            homePageFile,
            homePageMD.replace(/link:.*/, `link: ${recentLink}`),
          );
        }
      },
      configureServer({ watcher, restart }) {
        watcher.add("*.md").on("all", async (event) => {
          if (event !== "change") {
            await restart();
          }
        });
      },
    }],
  },
});
