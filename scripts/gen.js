import { join } from "path";
import { existsSync } from "fs";
import { writeFile } from "fs/promises";

async function gen() {
  const now = new Date().toLocaleDateString();

  const filePath = join("docs", `${now}.md`);

  // 如果已经存在则跳出
  if (existsSync(filePath)) {
    return;
  }

  await writeFile(
    filePath,
    `---
title: ${now.replace(/\//g, '-')}
---

# {{ $frontmatter.title }}

## 仓库快读

> 

<br />
<br />

## 文章小报
`,
  );
}

gen();
