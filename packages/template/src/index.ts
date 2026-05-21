/**
 * @pi/template - Template package for pi-agent-ext monorepo
 */

export interface TemplateConfig {
	name: string;
	version: string;
}

export function createTemplate(config: TemplateConfig): string {
	return `Template: ${config.name}@${config.version}`;
}
