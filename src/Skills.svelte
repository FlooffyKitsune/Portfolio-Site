<script lang="ts">
    import HTML5 from "virtual:icons/simple-icons/html5";
    import CSS3 from "virtual:icons/simple-icons/css3";
    import SASS from "virtual:icons/simple-icons/sass";
    import JS from "virtual:icons/simple-icons/javascript";
    import TS from "virtual:icons/simple-icons/typescript";
    import Svelte from "virtual:icons/simple-icons/svelte";
    import React from "virtual:icons/simple-icons/react";
    import Redux from "virtual:icons/simple-icons/redux";
    import NodeJS from "virtual:icons/simple-icons/nodedotjs";
    import Python from "virtual:icons/simple-icons/python";
    import PHP from "virtual:icons/simple-icons/php";
    import Java from "virtual:icons/fa-brands/java";
    import MySQL from "virtual:icons/simple-icons/mysql";
    import MongoDB from "virtual:icons/simple-icons/mongodb";
    import Firebase from "virtual:icons/simple-icons/firebase";
    import Git from "virtual:icons/simple-icons/git";
    import GitHub from "virtual:icons/simple-icons/github";
    import VSCode from "virtual:icons/simple-icons/visualstudiocode";
    import AdobeSuite from "virtual:icons/simple-icons/adobecreativecloud";
    import Blender from "virtual:icons/simple-icons/blender";
    import AWS from "virtual:icons/simple-icons/amazonaws";
    import NPM from "virtual:icons/simple-icons/npm";
    import Yarn from "virtual:icons/simple-icons/yarn";
</script>

<section id="skills">
    <h2>Skills</h2>
    <div class="skills-wrapper">
        <div class="skills-card">
            <h3>Front-end</h3>
            <ul>
                <li>HTML <HTML5 /></li>
                <li>CSS <CSS3 /></li>
                <li>SASS <SASS /></li>
                <li>JavaScript <JS /></li>
                <li>TypeScript <TS /></li>
                <li>Svelte <Svelte /></li>
                <li>React <React /></li>
                <li>Redux <Redux /></li>
            </ul>
        </div>
        <div class="skills-card">
            <h3>Back-end</h3>
            <ul>
                <li>Node.js <NodeJS /></li>
                <li>Python <Python /></li>
                <li>PHP <PHP /></li>
                <li>Java <Java /></li>
                <li>MySQL <MySQL /></li>
                <li>MongoDB <MongoDB /></li>
                <li>Firebase <Firebase /></li>
            </ul>
        </div>
        <div class="skills-card">
            <h3>Tools</h3>
            <ul>
                <li>Git <Git /></li>
                <li>GitHub <GitHub /></li>
                <li>VS Code <VSCode /></li>
                <li>Adobe Suite <AdobeSuite /></li>
                <li>Blender <Blender /></li>
                <li>AWS <AWS /></li>
                <li>NPM <NPM /></li>
                <li>Yarn <Yarn /></li>
            </ul>
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

    #skills {
        background-color: #1f1f1f;
        width: 100%;
        padding: 0 13%;

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
        
        .skills-wrapper {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;

            .skills-card {
                flex-grow: 1;
                flex-basis: 0;
                display: flex;
                flex-direction: column;
                border: none;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 4px 21px -12px rgba(0,0,0,.66);
                margin: 0.5rem;
                background-color: #2c2f33;
                color: #fff;

                h3 {
                    font-family: 'Ubuntu', sans-serif;
                    font-size: 2rem;
                    padding: 1rem;
                    text-align: center;
                    background-image: linear-gradient(to right top, #ff6f91, #ff807d, #ff966d, #ffae61, #ffc75f);
                }

                ul {
                    list-style: none;
                    padding: 1rem;
                    font-size: 1.25rem;
                    font-family: 'Unna', serif;
                    text-align: left;

                    li {
                        padding: 0.5rem;
                        font-size: 1.5rem;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                }
            }
        }
    }
</style>