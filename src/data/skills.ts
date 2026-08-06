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
		title: 'Front-end',
		items: [
			{ label: 'HTML', iconKey: 'simple-icons/html5' },
			{ label: 'CSS', iconKey: 'simple-icons/css3' },
			{ label: 'SASS', iconKey: 'simple-icons/sass' },
			{ label: 'JavaScript', iconKey: 'simple-icons/javascript' },
			{ label: 'TypeScript', iconKey: 'simple-icons/typescript' },
			{ label: 'Svelte', iconKey: 'simple-icons/svelte' },
			{ label: 'React', iconKey: 'simple-icons/react' },
			{ label: 'Redux', iconKey: 'simple-icons/redux' }
		]
	},
	{
		title: 'Back-end',
		items: [
			{ label: 'Node.js', iconKey: 'simple-icons/nodedotjs' },
			{ label: 'Python', iconKey: 'simple-icons/python' },
			{ label: 'PHP', iconKey: 'simple-icons/php' },
			{ label: 'Java', iconKey: 'fa-brands/java' },
			{ label: 'MySQL', iconKey: 'simple-icons/mysql' },
			{ label: 'MongoDB', iconKey: 'simple-icons/mongodb' },
			{ label: 'Firebase', iconKey: 'simple-icons/firebase' }
		]
	},
	{
		title: 'Tools',
		items: [
			{ label: 'Git', iconKey: 'simple-icons/git' },
			{ label: 'GitHub', iconKey: 'simple-icons/github' },
			{ label: 'VS Code', iconKey: 'simple-icons/visualstudiocode' },
			{ label: 'Adobe Suite', iconKey: 'simple-icons/adobecreativecloud' },
			{ label: 'Blender', iconKey: 'simple-icons/blender' },
			{ label: 'AWS', iconKey: 'simple-icons/amazonaws' },
			{ label: 'NPM', iconKey: 'simple-icons/npm' },
			{ label: 'Yarn', iconKey: 'simple-icons/yarn' }
		]
	}
];
