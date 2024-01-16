<script lang="ts">
    import DocumentSolid from "virtual:icons/basil/document-solid";
</script>

<section id="about">
    <div class="about-wrapper">
        <img src="/images/jarrett.png" alt="Jarrett Dominic">
        <div class="about-content">
            <h2>About Me</h2>
            <p>I'm a versatile developer with a primary focus on front-end development. In addition to my expertise in crafting user-friendly interfaces, I bring valuable experience in backend development and graphic design to the table. My coding journey is fueled by a genuine passion for creating digital experiences that seamlessly blend aesthetics and functionality. From developing interactive web applications to designing captivating user interfaces, I thrive on turning ideas into reality.</p>
            <p>Beyond the screen, I enjoy working on DIY projects and building things from scratch, as well as working with virtual reality. When not immersed in the digital world, you can find me pursuing outdoor adventures whether it be mountain biking or rock climbing.</p>
        </div>
    </div>
    <div class="resume-button">
        <a href="/pdf/JarrettDominicResume.pdf" target="_blank"><span>Download CV</span><DocumentSolid style="font-size: 1.5rem;" /></a>
    </div>
</section>

<style lang="scss">
    @import url('https://fonts.googleapis.com/css2?family=Ubuntu&family=Unna&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Unna&display=swap');

    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    #about {
        width: 100%;
        padding-bottom: 10rem;
        background-color: #1f1f1f;
        justify-content: center;

        .about-wrapper {
            width: 100%;
            height: 27rem;
            display: flex;
            justify-content: center;
            align-items: center;

            img {
                width: 20rem;
                height: 20rem;
                border-radius: 50px;
            }

            .about-content {
                width: 50%;
                height: 20rem;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: left;
                padding: 0 2rem;
                color: #fff;

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

                p {
                    font-family: 'Unna', serif;
                    font-size: 1.2rem;
                    text-align: left;
                    margin-bottom: 1rem;
                }
            }
        }

        .resume-button {
                width: 15rem;
                height: 3.5rem;
                display: flex;
                justify-content: center;
                align-items: center;
                background-image: linear-gradient(to right, #fff, #fff);
                margin: -3rem auto;
                border-radius: 15px;

                a {
                    text-decoration: none;
                    color: #1f1f1f;
                    font-family: 'Ubuntu', sans-serif;
                    font-size: 1.2rem;
                    font-weight: 700;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 0 2rem;
                    height: 100%;
                    width: 100%;

                    span {
                        padding-right: 1rem;
                    }
                }

                &:hover {
                    background-image: linear-gradient(to right top, #ff6f91, #ff807d, #ff966d, #ffae61, #ffc75f);
                    border-radius: 15px;
                    a {
                        color: #fff;
                    }
                }
            }
    }
</style>