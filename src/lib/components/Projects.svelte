<script lang="ts">
    import GitHub from "virtual:icons/simple-icons/github";
    import Netlify from "virtual:icons/simple-icons/netlify";
    import HTML from "virtual:icons/vscode-icons/file-type-html";
    import CSS from "virtual:icons/vscode-icons/file-type-css";
    import JavaScript from "virtual:icons/vscode-icons/file-type-js-official";
    import React from "virtual:icons/vscode-icons/file-type-reactjs";
    import Semantic from "virtual:icons/logos/semantic-ui";
    import YouTube from "virtual:icons/logos/youtube-icon";
    import AdobeSuite from "virtual:icons/simple-icons/adobecreativecloud";
    import Doc from "virtual:icons/simple-line-icons/doc";
    import Blender from "virtual:icons/logos/blender";
    import Autodesk from "virtual:icons/simple-icons/autodesk";
    import Svelte from "virtual:icons/logos/svelte-icon";
    import Vite from "virtual:icons/logos/vitejs";
    import TypeScript from "virtual:icons/logos/typescript-icon";
    import SASS from "virtual:icons/logos/sass";
    import Vercel from "virtual:icons/logos/vercel-icon";
</script>

<section id="projects">
    <h2>Projects</h2>
    <div class="projects-wrapper">
        <div class="project-card">
            <img src="/images/projects/portfolio.png" alt="portfolio site preview">
            <div class="project-content">
                <div class="project-header">
                    <h3>Portfolio</h3>
                    <div class="project-stack">
                        <span><Svelte /></span><span><Vite /></span><span><TypeScript /></span><span><SASS /></span><span><Vercel /></span>
                    </div>
                </div>
                <p>A constantly evolving showcase of projects I've worked on. My portfolio is a more professional representation of my work and skills. The site is built on Svelte with SASS and Typescript and is hosted through Vercel.  All graphical assets are made by me utilizing Photoshop, Illustrator and Blender.</p>
                <div class="project-links">
                    <a href="https://github.com/FlooffyKitsune/Portfolio-Site" target="_blank"><GitHub /><span>GitHub</span></a>
                </div>
            </div>
        </div>
        <div class="project-card">
            <img src="/images/projects/tube.png" alt="video player app preview">
            <div class="project-content">
                <div class="project-header">
                    <h3>YT-App</h3>
                    <div class="project-stack">
                        <span><React /></span><span><JavaScript /></span><span><Semantic /></span><span><YouTube /></span>
                    </div>
                </div>
                <p>A basic React base site that utilizes Google's API to allow the user to search YouTube videos through a search bar. A main video is displayed with its title and description and five suggested videos and their titles are shown as well. SemanticUI was utilized for quick formatting of the site content.</p>
                <div class="project-links">
                    <a href="https://github.com/FlooffyKitsune/yt-app" target="_blank"><GitHub /><span>GitHub</span></a>
                    <a href="https://waffletube.netlify.app/" target="_blank"><Netlify /><span>Demo</span></a>
                </div>
            </div>
        </div>
        <div class="project-card">
            <img src="/images/projects/h2g2.png" alt="book page preview">
            <div class="project-content">
                <div class="project-header">
                    <h3>H2G2</h3>
                    <div class="project-stack">
                        <span><HTML /></span><span><CSS /></span><span><JavaScript /></span>
                    </div>
                </div>
                <p>A basic site built with vanilla HTML, CSS, and JavaScript. This site was built for a class with the intent of creating a simple and efficient site about a book.  JavaScript was minimally used to add some simple animations to the site.</p>
                <div class="project-links">
                    <a href="https://github.com/FlooffyKitsune/h2g2" target="_blank"><GitHub /><span>GitHub</span></a>
                    <a href="https://h2g2.netlify.app/" target="_blank"><Netlify /><span>Demo</span></a>
                </div>
            </div>
        </div>
        <div class="project-card">
            <img src="/images/projects/35below.png" alt="35 below redesign preview">
            <div class="project-content">
                <div class="project-header">
                    <h3>35 Below</h3>
                    <div class="project-stack">
                        <span><AdobeSuite color="#fff" /></span>
                    </div>
                </div>
                <p>Consulting services were provided to 35 Below in regards to a potential overhaul for their brand's website.  The design was made in Adobe XD with some minor edits to photos in Photoshop.  The intent was to keep their site light-weight, but modernize it and introduce design standards.</p>
                <div class="project-links">
                    <a href="/images/35BelowBA.webp" target="_blank"><Doc /><span>Before / After</span></a>
                </div>
            </div>
        </div>
        <div class="project-card">
            <img src="/images/projects/caffeine.png" alt="caffeine redesign preview">
            <div class="project-content">
                <div class="project-header">
                    <h3>Caffeine</h3>
                    <div class="project-stack">
                        <span><AdobeSuite color="#fff" /></span>
                    </div>
                </div>
                <p>I was commissioned to redo all of the store's signs, menus, and logos.  All work was done in Adobe Illustrator and organized files were provided to Caffeine for easy adjustments and future updates to content.</p>
                <div class="project-links">
                    <a href="/pdf/CaffeineWinter.pdf" target="_blank"><Doc /><span>Example</span></a>
                </div>
            </div>
        </div>
        <div class="project-card">
            <img src="/images/projects/kl.png" alt="misc design work preview">
            <div class="project-content">
                <div class="project-header">
                    <h3>Miscellaneous Work</h3>
                    <div class="project-stack">
                        <span><AdobeSuite color="#fff" /></span><span><Blender /></span><span><Autodesk /></span>
                    </div>
                </div>
                <p>A collection of some different works commissioned from me (only works I was given permission to share are shown).</p>
                <div class="project-links">
                    <a href="/images/projects/works.png" target="_blank"><Doc /><span>View</span></a>
                </div>
            </div>
        </div>
    </div>
</section>

<style lang="scss">
    @import url('https://fonts.googleapis.com/css2?family=Ubuntu&family=Unna&display=swap');

    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    #projects {
        background-color: #1f1f1f;
        width: 100%;
        padding: 4rem 13% 0;

        h2 {
            font-family: 'Ubuntu', sans-serif;
            font-size: 2.5rem;
            margin-bottom: 1rem;
            background-image: linear-gradient(to right top, #ff6f91, #ff807d, #ff966d, #ffae61, #ffc75f);
            -webkit-text-fill-color: transparent;
            -webkit-background-clip: text;
            &::after {
                content: '';
                display: block;
                height: 2px;
                background: linear-gradient(to right, #ff6f91, #ff807d, #ff966d, #ffae61, #ffc75f) no-repeat;
            }
        }

        .projects-wrapper {
            display: flex;
            flex-direction: column;
            padding-bottom: 5rem;

            .project-card {
                display: flex;
                flex-direction: row;
                border: none;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 4px 21px -12px rgba(0,0,0,.66);
                margin: 1rem 0;

                img {
                    width: 35%;
                    height: 100%;
                    object-fit: cover;
                }

                .project-content {
                    width: 65%;
                    display: flex;
                    flex-direction: column;
                    background-color: #2C2F33;

                    .project-header {
                        display: flex;
                        flex-direction: row;
                        align-items: end;
                        justify-content: space-between;
                        padding: 1rem 2rem 0.25rem 1rem;

                        h3 {
                        font-family: 'Ubuntu', sans-serif;
                        color: #fff;
                        font-size: 2.5rem;
                        }

                        .project-stack {
                            display: flex;
                            flex-direction: row;
                            justify-content: flex-start;
                            padding-left: 1rem;

                            span {
                                display: flex;
                                flex-direction: row;
                                align-items: center;
                                font-size: 2rem;
                                padding: 0.2rem;
                            }
                        }
                    }

                    p {
                        font-family: 'Unna', serif;
                        color: #fff;
                        font-size: 1.5rem;
                        padding: 1rem;
                    }

                    .project-links {
                        display: flex;
                        flex-direction: row;
                        justify-content: flex-start;
                        padding: 1rem;

                        a {
                            display: flex;
                            flex-direction: row;
                            margin: 0 1rem;
                            padding: 0.5rem 1rem;
                            text-decoration: none;
                            color: #fff;
                            font-size: 1.5rem;
                            font-family: 'Unna', serif;
                            background: linear-gradient(to right top, #e4b7e5, #c498cd, #a47bb6, #845fa0, #63458a);
                            border: none;
                            border-radius: 20px;
                            overflow: hidden;

                            span {
                                padding-left: 0.5rem;
                            }
                        }
                    }
                }
            }
        }
    }

    @media screen and (max-width: 768px) {
        #projects {
            padding: 5rem 0 0 0;

            h2 {
                text-align: center;
            }

            .projects-wrapper {
                display: inline;

                .project-card {
                    flex-direction: column;
                    margin: 3rem 0 0 0;

                    img {
                        width: 100%;
                        object-fit: cover;
                    }

                    .project-content {
                        width: 100%;
                        padding: 2.5rem 0 0 0;
                        margin-top: 0;
                        text-align: center;

                        .project-header {
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            padding: 0;

                            h3 {
                                padding: 1rem 1.5rem;
                            }

                            .project-stack {
                                padding: 0;
                            }
                        }

                        p {
                            padding: 1rem 1.5rem;
                            text-align: left;
                        }

                        .project-links {
                            padding: 0;
                            margin: 1rem 0 2.5rem;

                            a {
                                padding: 0.5rem 1rem;
                            }
                        }
                    }
                }
            }
        }
    }
</style>