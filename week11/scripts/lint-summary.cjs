const { ESLint } = require("eslint");

async function main() {
  const eslint = new ESLint();
  const results = await eslint.lintFiles(["src/"]);
  const errors = results.reduce((n, result) => n + result.errorCount, 0);
  const warnings = results.reduce((n, result) => n + result.warningCount, 0);
  const formatter = await eslint.loadFormatter("stylish");
  const details = formatter.format(results);
  if (details) console.log(details);
  console.log(
    `ESLint: ${results.length} files, ${errors} error(s), ${warnings} warning(s)`,
  );
  process.exitCode = errors > 0 || warnings > 3 ? 1 : 0;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
