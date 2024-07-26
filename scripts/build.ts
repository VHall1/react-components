import { execa } from "execa";
import { glob } from "glob";
import { cpSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { rollup, type Plugin, type RollupOptions } from "rollup";
import esbuild from "rollup-plugin-esbuild";

// import alias from "@rollup/plugin-alias";
// const aliases = [
// 	{
// 		find: new RegExp(`^@victorhalldev/react`),
// 		replacement: resolve("..", "react", "src"),
// 	},
// ];

async function build() {
	const cwd = process.cwd();
	const flags = process.argv.slice(2);
	const tailwind = flags.includes("--tw");
	const packageJsonPath = resolve(cwd, "package.json");
	const packageJsonFileUrl = pathToFileURL(packageJsonPath).href;
	const packageJson = await import(packageJsonFileUrl);
	const name: string = packageJson.name;

	const plugins: Plugin[] = [
		esbuild({
			sourceMap: true,
			tsconfig: resolve(cwd, "tsconfig.json"),
			platform: "browser",
		}),
	];
	const deps = [...Object.keys(packageJson.dependencies ?? {}), ...Object.keys(packageJson.peerDependencies ?? {})];
	const external = deps.length ? new RegExp(`^(${deps.join("|")})`) : undefined;
	const entries = await glob("src/**/*.{ts,tsx}");
	const outputs: RollupOptions["output"] = [
		{
			format: "es",
			exports: "named",
			entryFileNames: "[name].mjs",
			dir: resolve(cwd, "dist", "esm"),
			preserveModules: true,
		},
		{
			format: "cjs",
			exports: "named",
			entryFileNames: "[name].cjs",
			dir: resolve(cwd, "dist", "cjs"),
			preserveModules: true,
		},
	];
	const config: RollupOptions = {
		input: entries,
		output: outputs,
		external,
		plugins,
	};

	console.log(`[${name}] Building...`);

	const build = await rollup(config);
	await Promise.all(outputs.map((output) => build.write(output)));

	console.log(`[${name}][JS] Generated CJS and ESM files ✅`);

	if (tailwind) {
		await execa("pnpm", ["tailwindcss", "-i", "theme.css", "-o", join("dist", "theme.css")], {
			cwd,
			// stdio: "inherit",
		});
		console.log(`[${name}][JS] Generated Tailwind classes ✅`);
	}

	await execa("pnpm", ["tsc", "--project", "tsconfig.build.json"], {
		cwd,
		stdio: "inherit",
	});

	try {
		cpSync(join(cwd, "dist", "types", "index.d.ts"), join(cwd, "dist", "types", "index.d.mts"));
	} catch {
		console.log("No .dts file found");
	}

	console.log(`[${name}][DTS] Generated type definitions ✅`);
}

build().catch((err) => {
	console.error(err);
	process.exit(1);
});
