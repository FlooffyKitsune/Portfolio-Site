import Html5 from 'virtual:icons/simple-icons/html5';
import Css3 from 'virtual:icons/simple-icons/css3';
import SassSimple from 'virtual:icons/simple-icons/sass';
import JavascriptSimple from 'virtual:icons/simple-icons/javascript';
import TypescriptSimple from 'virtual:icons/simple-icons/typescript';
import SvelteSimple from 'virtual:icons/simple-icons/svelte';
import ReactSimple from 'virtual:icons/simple-icons/react';
import Redux from 'virtual:icons/simple-icons/redux';
import NodeDotJs from 'virtual:icons/simple-icons/nodedotjs';
import Python from 'virtual:icons/simple-icons/python';
import Php from 'virtual:icons/simple-icons/php';
import Java from 'virtual:icons/fa-brands/java';
import MySql from 'virtual:icons/simple-icons/mysql';
import MongoDb from 'virtual:icons/simple-icons/mongodb';
import Firebase from 'virtual:icons/simple-icons/firebase';
import Git from 'virtual:icons/simple-icons/git';
import GithubSimple from 'virtual:icons/simple-icons/github';
import VsCode from 'virtual:icons/simple-icons/visualstudiocode';
import AdobeCreativeCloud from 'virtual:icons/simple-icons/adobecreativecloud';
import BlenderSimple from 'virtual:icons/simple-icons/blender';
import AmazonAws from 'virtual:icons/simple-icons/amazonaws';
import Npm from 'virtual:icons/simple-icons/npm';
import Yarn from 'virtual:icons/simple-icons/yarn';
import Netlify from 'virtual:icons/simple-icons/netlify';
import Autodesk from 'virtual:icons/simple-icons/autodesk';
import SvelteLogo from 'virtual:icons/logos/svelte-icon';
import ViteLogo from 'virtual:icons/logos/vitejs';
import TypescriptLogo from 'virtual:icons/logos/typescript-icon';
import SassLogo from 'virtual:icons/logos/sass';
import VercelLogo from 'virtual:icons/logos/vercel-icon';
import BlenderLogo from 'virtual:icons/logos/blender';
import SemanticUiLogo from 'virtual:icons/logos/semantic-ui';
import YoutubeLogo from 'virtual:icons/logos/youtube-icon';
import ReactVscode from 'virtual:icons/vscode-icons/file-type-reactjs';
import JsVscode from 'virtual:icons/vscode-icons/file-type-js-official';
import HtmlVscode from 'virtual:icons/vscode-icons/file-type-html';
import CssVscode from 'virtual:icons/vscode-icons/file-type-css';
import DocLine from 'virtual:icons/simple-line-icons/doc';
import DocumentSolid from 'virtual:icons/basil/document-solid';
import GithubMdi from 'virtual:icons/mdi/github';
import LinkedinMdi from 'virtual:icons/mdi/linkedin';
import EmailMdi from 'virtual:icons/mdi/email';

// unplugin-icons compiles each import to a Svelte component; `any` avoids
// fighting the generated component types just to store them in a lookup map.
export const icons: Record<string, any> = {
	'simple-icons/html5': Html5,
	'simple-icons/css3': Css3,
	'simple-icons/sass': SassSimple,
	'simple-icons/javascript': JavascriptSimple,
	'simple-icons/typescript': TypescriptSimple,
	'simple-icons/svelte': SvelteSimple,
	'simple-icons/react': ReactSimple,
	'simple-icons/redux': Redux,
	'simple-icons/nodedotjs': NodeDotJs,
	'simple-icons/python': Python,
	'simple-icons/php': Php,
	'fa-brands/java': Java,
	'simple-icons/mysql': MySql,
	'simple-icons/mongodb': MongoDb,
	'simple-icons/firebase': Firebase,
	'simple-icons/git': Git,
	'simple-icons/github': GithubSimple,
	'simple-icons/visualstudiocode': VsCode,
	'simple-icons/adobecreativecloud': AdobeCreativeCloud,
	'simple-icons/blender': BlenderSimple,
	'simple-icons/amazonaws': AmazonAws,
	'simple-icons/npm': Npm,
	'simple-icons/yarn': Yarn,
	'simple-icons/netlify': Netlify,
	'simple-icons/autodesk': Autodesk,
	'logos/svelte-icon': SvelteLogo,
	'logos/vitejs': ViteLogo,
	'logos/typescript-icon': TypescriptLogo,
	'logos/sass': SassLogo,
	'logos/vercel-icon': VercelLogo,
	'logos/blender': BlenderLogo,
	'logos/semantic-ui': SemanticUiLogo,
	'logos/youtube-icon': YoutubeLogo,
	'vscode-icons/file-type-reactjs': ReactVscode,
	'vscode-icons/file-type-js-official': JsVscode,
	'vscode-icons/file-type-html': HtmlVscode,
	'vscode-icons/file-type-css': CssVscode,
	'simple-line-icons/doc': DocLine,
	'basil/document-solid': DocumentSolid,
	'mdi/github': GithubMdi,
	'mdi/linkedin': LinkedinMdi,
	'mdi/email': EmailMdi
};
