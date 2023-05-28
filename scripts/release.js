import { execSync } from "child_process"
import { select } from "@inquirer/prompts";

const choices = [
  "patch",
  "minor",
  "major",
  "prepatch",
  "premajor",
  "preminor",
  "prerelease",
].map(c => ({ name: c, value: c }))

const version = await select({
  message: "选择你要发布的版本",
  choices
});

execSync(`changelogen --${version} --release && git push --follow-tags`)
