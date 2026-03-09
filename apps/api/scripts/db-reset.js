const { execSync } = require("child_process");

function run(cmd) {
  execSync(cmd, { stdio: "inherit", cwd: __dirname + "/.." });
}

run("npx prisma migrate reset --force --skip-seed --config=./prisma.config.ts");
run("npx prisma db seed --config=./prisma.config.ts");
