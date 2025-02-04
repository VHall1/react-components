import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
	stories: [
		"../packages/react/__stories__/**/*.mdx",
		"../packages/react/__stories__/**/*.stories.@(js|jsx|mjs|ts|tsx)",
	],
	addons: ["@storybook/addon-a11y", "@storybook/addon-essentials"],
	framework: {
		name: "@storybook/react-vite",
		options: {},
	},
};

export default config;
