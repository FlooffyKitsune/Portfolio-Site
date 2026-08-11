export interface SkillItem {
	label: string;
	iconKey: string;
}

export interface SkillGroup {
	title: string;
	items: SkillItem[];
}

// Order matters: the last group renders full-width below the 2-column grid
// (see the `:last-child` rule in skills.astro) — keep "Tools & Infrastructure"
// last if this list is ever reordered.
export const skillGroups: SkillGroup[] = [
	{
		title: 'Programming',
		items: [
			{ label: 'TypeScript', iconKey: 'logos/typescript-icon' },
			{ label: 'JavaScript', iconKey: 'logos/javascript' },
			{ label: 'Python', iconKey: 'logos/python' },
			{ label: 'Java', iconKey: 'logos/java' },
			{ label: 'PHP', iconKey: 'logos/php' },
			{ label: 'Lua', iconKey: 'logos/lua' },
			{ label: 'SQL', iconKey: 'mdi/database' }
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
			{ label: 'MongoDB', iconKey: 'logos/mongodb-icon' }
		]
	},
	{
		title: 'Game Development',
		items: [
			{ label: 'Godot', iconKey: 'logos/godot-icon' },
			{ label: 'Game Systems', iconKey: 'mdi/gamepad-variant-outline' },
			{ label: 'Gameplay Programming', iconKey: 'mdi/application-brackets-outline' },
			{ label: 'UI / UX', iconKey: 'mdi/view-dashboard-outline' },
			{ label: 'Asset Integration', iconKey: 'mdi/cube-scan' }
		]
	},
	{
		title: '3D & 2D',
		items: [
			{ label: 'Blender', iconKey: 'logos/blender' },
			{ label: 'Clip Studio Paint', iconKey: 'mdi/brush-variant' },
			{ label: 'Photoshop', iconKey: 'logos/adobe-photoshop' },
			{ label: 'Illustrator', iconKey: 'logos/adobe-illustrator' },
			{ label: '3D Modeling', iconKey: 'mdi/cube-outline' },
			{ label: '2D Illustration', iconKey: 'mdi/pencil-outline' }
		]
	},
	{
		title: 'Tools & Infrastructure',
		items: [
			{ label: 'Git', iconKey: 'logos/git-icon' },
			{ label: 'VS Code', iconKey: 'logos/visual-studio-code' },
			{ label: 'AWS', iconKey: 'logos/aws' },
			{ label: 'Firebase', iconKey: 'logos/firebase-icon' },
			{ label: 'Three.js', iconKey: 'logos/threejs' },
			{ label: 'Supabase', iconKey: 'logos/supabase-icon' },
			{ label: 'Docker', iconKey: 'logos/docker-icon' },
			{ label: 'Adobe Creative Suite', iconKey: 'logos/adobe-icon' },
			{ label: 'Autodesk', iconKey: 'simple-icons/autodesk' },
			{ label: 'Maxon', iconKey: 'simple-icons/cinema4d' },
			{ label: 'Ollama', iconKey: 'simple-icons/ollama' }
		]
	}
];
