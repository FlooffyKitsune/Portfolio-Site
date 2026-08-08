export interface SkillItem {
	label: string;
	iconKey: string;
}

export interface SkillGroup {
	title: string;
	items: SkillItem[];
}

export const skillGroups: SkillGroup[] = [
	{
		title: 'Languages',
		items: [
			{ label: 'TypeScript', iconKey: 'logos/typescript-icon' },
			{ label: 'JavaScript', iconKey: 'logos/javascript' },
			{ label: 'Python', iconKey: 'logos/python' },
			{ label: 'Java', iconKey: 'logos/java' },
			{ label: 'PHP', iconKey: 'logos/php' },
			{ label: 'Lua', iconKey: 'logos/lua' },
			{ label: 'SQL', iconKey: 'mdi/database' },
			{ label: 'HTML', iconKey: 'logos/html-5' },
			{ label: 'CSS', iconKey: 'logos/css-3' }
		]
	},
	{
		title: 'Full-Stack Development',
		items: [
			{ label: 'React', iconKey: 'logos/react' },
			{ label: 'Svelte', iconKey: 'logos/svelte-icon' },
			{ label: 'Astro', iconKey: 'logos/astro-icon' },
			{ label: 'Next.js', iconKey: 'logos/nextjs-icon' },
			{ label: 'Node.js', iconKey: 'logos/nodejs-icon' },
			{ label: 'REST APIs', iconKey: 'mdi/api' },
			{ label: 'MySQL', iconKey: 'logos/mysql' },
			{ label: 'MongoDB', iconKey: 'logos/mongodb-icon' },
			{ label: 'Firebase', iconKey: 'logos/firebase-icon' },
			{ label: 'Three.js', iconKey: 'logos/threejs' },
			{ label: 'Supabase', iconKey: 'logos/supabase-icon' }
		]
	},
	{
		title: 'Game Development',
		items: [
			{ label: 'Godot', iconKey: 'logos/godot-icon' },
			{ label: 'Game Systems', iconKey: 'mdi/gamepad-variant-outline' },
			{ label: 'Gameplay Programming', iconKey: 'mdi/application-brackets-outline' },
			{ label: 'UI / UX', iconKey: 'mdi/view-dashboard-outline' },
			{ label: '3D Asset Integration', iconKey: 'mdi/cube-scan' }
		]
	},
	{
		title: 'Creative',
		items: [
			{ label: 'Blender', iconKey: 'logos/blender' },
			{ label: 'Clip Studio Paint', iconKey: 'mdi/brush-variant' },
			{ label: 'Photoshop', iconKey: 'logos/adobe-photoshop' },
			{ label: 'Illustrator', iconKey: 'logos/adobe-illustrator' },
			{ label: '3D Modeling', iconKey: 'mdi/cube-outline' },
			{ label: '2D Illustration', iconKey: 'mdi/pencil-outline' },
			{ label: 'UI Design', iconKey: 'mdi/palette-swatch' },
			{ label: 'Graphic Design', iconKey: 'mdi/palette' }
		]
	},
	{
		title: 'Tools & Infrastructure',
		items: [
			{ label: 'Git', iconKey: 'logos/git-icon' },
			{ label: 'GitHub', iconKey: 'simple-icons/github' },
			{ label: 'VS Code', iconKey: 'logos/visual-studio-code' },
			{ label: 'Docker', iconKey: 'logos/docker-icon' },
			{ label: 'AWS', iconKey: 'logos/aws' },
			{ label: 'Adobe Creative Suite', iconKey: 'logos/adobe-icon' },
			{ label: 'Autodesk', iconKey: 'simple-icons/autodesk' },
			{ label: 'Maxon', iconKey: 'simple-icons/cinema4d' },
			{ label: 'Ollama', iconKey: 'simple-icons/ollama' }
		]
	}
];
