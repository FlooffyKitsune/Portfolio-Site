<script lang="ts">
    import { onMount } from "svelte";
    import {logo, logoStyle } from "../utils/logo";

    import Header from "$lib/components/Header.svelte";
    import About from "$lib/components/About.svelte";
    import Skills from "$lib/components/Skills.svelte";
    import Projects from "$lib/components/Projects.svelte";
    import Github from "virtual:icons/mdi/github";
    import Linkedin from "virtual:icons/mdi/linkedin";

    onMount(() => {
        console.log(logo, logoStyle);
    });
</script>

<svelte:head>
    <title>Jarrett Dominic</title>
</svelte:head>

<Header />

<h1>Jarrett Dominic</h1>
<main>
    <img id="background" src="/images/svg/wave.svg" alt="Background">
    <div class="landing-wrapper">
        <div class="landing-content">
            <h2>Hi, I am Jarrett Dominic.</h2>
            <p>I'm a Full-Stack Developer based in Tampa, Florida.</p>
        </div>
        <div class="button-wrapper">
            <a href="https://github.com/FlooffyKitsune" target="_blank"><Github style="font-size: 2.5rem; margin-top: 0.5rem;" /></a>
            <a href="https://www.linkedin.com/in/jarrett-dominic/" target="_blank"><Linkedin style="font-size: 2.5rem; margin-top: 1rem;" /></a>
        </div>
    </div>
    <div class="gradient"></div>
</main>

<About />
<Skills />
<Projects />

<footer>
    <p>© 2024 Jarrett Dominic</p>
</footer>

<style lang="scss">
    @import url('https://fonts.googleapis.com/css2?family=Ubuntu&family=Unna&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Inknut+Antiqua:wght@500;700&display=swap');

    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    h1 {
        position: absolute;
        top: -9999px;
    }

    main {
        width: 100%;
        height: 50rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: #fff;
        font-family: 'Ubuntu', sans-serif;
        margin-bottom: -2rem;

        #background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: calc(50rem + 96px);
            object-fit: cover;
            object-position: center;
            z-index: -1;
            opacity: 0.2;
        }

        .gradient {
            width: 100%;
            height: 6rem; /* Adjust the height of the gradient effect */
            background: linear-gradient(to bottom, rgba(255, 0, 191, 0), #1f1f1f);
            position: absolute;
            top: 50rem;
            border-bottom: #1f1f1f 2rem solid;

        }
    }

    .landing-wrapper {
        display: flex;
        flex-direction: row-reverse;
        width: 100%;

        .landing-content {
            width: 63%;
            padding: 0 2rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
            border-left: #fff 1px solid;

            h2 {
                font-family: 'Inknut Antiqua', serif;
                font-size: 3rem;
                font-weight: 700;
                background: linear-gradient(to right top, #e4b7e5, #c498cd, #a47bb6, #845fa0, #63458a);
                -webkit-text-fill-color: transparent;
                -webkit-background-clip: text;
            }

            p {
                font-size: 1.5rem;
                padding-bottom: 2rem;
            }
        }

        .button-wrapper {
            width: 37%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: end;
            padding-right: 1rem;

            a {
                color: #fff;
                transition: all 0.2s ease-in-out;

                &:hover {
                    color: #e4b7e5;
                }
            }
        }
    }

    footer {
        width: 100%;
        height: 6rem;
        background: #1f1f1f;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #fff;
        font-family: 'Ubuntu', sans-serif;
        font-size: 1.2rem;
    }

    @media screen and (max-width: 768px) {
        main {
            height: 100%;
            margin: 5rem 0;

            #background {
                height: 100vh;
            }

            .gradient {
                display: none;
            }
        }

        .landing-wrapper {
            flex-direction: column;
            justify-content: center;
            align-items: center;

            .landing-content {
                width: 100%;
                border-left: none;
                border-bottom: #fff 1px solid;
                padding: 0 2rem;
                text-align: center;

                h2 {
                    font-size: 2rem;
                }

                p {
                    font-size: 1.2rem;
                }
            }

            .button-wrapper {
                width: 100%;
                padding: 0;
                margin-top: 1rem;
                flex-direction: row;
                justify-content: center;
                align-items: center;

                a {
                    margin: 0 1rem;
                }
            }
        }
    }
</style>