export interface Hotspot {
	id: string;
	route: string;
	label: string;
}

export const hotspots: Hotspot[] = [
	{ id: 'about', route: '/about', label: 'About' },
	{ id: 'skills', route: '/skills', label: 'Skills' },
	{ id: 'projects', route: '/projects', label: 'Projects' },
	{ id: 'portfolio', route: '/portfolio', label: 'Portfolio' },
	{ id: 'contact', route: '/contact', label: 'Contact' }
];
