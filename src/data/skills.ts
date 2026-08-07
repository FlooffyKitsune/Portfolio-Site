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
			{ label: 'TypeScript', iconKey: 'simple-icons/typescript' },
			{ label: 'JavaScript', iconKey: 'simple-icons/javascript' },
			{ label: 'Python', iconKey: 'simple-icons/python' },
			{ label: 'Java', iconKey: 'fa-brands/java' },
			{ label: 'PHP', iconKey: 'simple-icons/php' },
			{ label: 'Lua', iconKey: 'simple-icons/lua' },
			{ label: 'SQL', iconKey: 'mdi/database' },
			{ label: 'HTML', iconKey: 'simple-icons/html5' },
			{ label: 'CSS', iconKey: 'simple-icons/css3' }
		]
	},
	{
		title: 'Full-Stack Development',
		items: [
			{ label: 'React', iconKey: 'simple-icons/react' },
			{ label: 'Svelte', iconKey: 'simple-icons/svelte' },
			{ label: 'Astro', iconKey: 'simple-icons/astro' },
			{ label: 'Next.js', iconKey: 'simple-icons/nextdotjs' },
			{ label: 'Node.js', iconKey: 'simple-icons/nodedotjs' },
			{ label: 'REST APIs', iconKey: 'mdi/api' },
			{ label: 'MySQL', iconKey: 'simple-icons/mysql' },
			{ label: 'MongoDB', iconKey: 'simple-icons/mongodb' },
			{ label: 'Firebase', iconKey: 'simple-icons/firebase' },
			{ label: 'Three.js', iconKey: 'simple-icons/threedotjs' },
			{ label: 'Supabase', iconKey: 'simple-icons/supabase' }
		]
	},
	{
		title: 'Game Development',
		items: [
			{ label: 'Godot', iconKey: 'simple-icons/godotengine' },
			{ label: 'Game Systems', iconKey: 'mdi/gamepad-variant-outline' },
			{ label: 'Gameplay Programming', iconKey: 'mdi/application-brackets-outline' },
			{ label: 'UI / UX', iconKey: 'mdi/view-dashboard-outline' },
			{ label: '3D Asset Integration', iconKey: 'mdi/cube-scan' }
		]
	},
	{
		title: 'Creative',
		items: [
			{ label: 'Blender', iconKey: 'simple-icons/blender' },
			{ label: 'Clip Studio Paint', iconKey: 'mdi/brush-variant' },
			{ label: '3D Modeling', iconKey: 'mdi/cube-outline' },
			{ label: '3D Animation', iconKey: 'mdi/animation-play-outline' },
			{ label: '2D Illustration', iconKey: 'mdi/pencil-outline' },
			{ label: 'UI Design', iconKey: 'mdi/palette-swatch' },
			{ label: 'Graphic Design', iconKey: 'mdi/palette' }
		]
	},
	{
		title: 'Tools & Infrastructure',
		items: [
			{ label: 'Git', iconKey: 'simple-icons/git' },
			{ label: 'GitHub', iconKey: 'simple-icons/github' },
			{ label: 'VS Code', iconKey: 'simple-icons/visualstudiocode' },
			{ label: 'Docker', iconKey: 'simple-icons/docker' },
			{ label: 'AWS', iconKey: 'simple-icons/amazonaws' },
			{ label: 'Adobe Creative Suite', iconKey: 'simple-icons/adobecreativecloud' }
		]
	}
];
