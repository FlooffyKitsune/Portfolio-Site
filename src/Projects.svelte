<script lang="ts">
    /**
     * Projects to be listed:
     *  - This website
     *  - YT-App
     *  - Streams-App (Maybe? No live demo...)
     *  - H2G2
     *  - Boba Site Rework
     *  - Caffeine Work
     *  - Any logo/design work
    */
</script>

<section id="projects">
    <h2>Projects</h2>
    <div class="projects-wrapper">

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
    }
</style>