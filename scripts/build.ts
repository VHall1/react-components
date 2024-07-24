import * as esbuild from "esbuild";
import { execa } from "execa";
import { cpSync } from "node:fs";
import { join } from "node:path";

async function build() {
	const path = process.cwd();
	const name = "packageJson.name";

	const entry = join(path, "index.ts");
	const dist = join(path, "dist");
	const config: Parameters<typeof esbuild.build>[0] = {
		entryPoints: [entry],
		bundle: true,
		sourcemap: true,
		format: "cjs",
		target: "es2022",
		outdir: dist,
	};

	console.log(`Building ${join(dist, "index.js")}`);
	await esbuild.build(config);

	console.log(`Building ${join(dist, "index.mjs")}`);
	await esbuild.build({
		...config,
		format: "esm",
		outExtension: { ".js": ".mjs" },
	});

	console.log(`Building ${join(dist, "index.d.ts")}`);
	await execa("pnpm", ["tsc", "--project", "tsconfig.build.json"], {
		cwd: path,
		stdio: "inherit",
	});

	try {
		cpSync(join(dist, "types", "index.d.ts"), join(dist, "types", "index.d.mts"));
	} catch {
		console.log("No .dts file found");
	}
}

build().catch((err) => {
	console.error(err);
	process.exit(1);
});
