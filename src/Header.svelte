<script lang="ts">

</script>

<header>
    <img src="/images/svg/logo.svg?v=1" alt="Logo">
    <nav>
        <ul>
            <li><a href="#about">About</a></li>
            <li><a href="#skills">Skills</a></li>
            <li><a href="#projects">Projects</a></li>
        </ul>
    </nav>
</header>

<style lang="scss">
    @import url('https://fonts.googleapis.com/css2?family=Ubuntu&family=Unna&display=swap');
    
    header {
        display: flex;
        flex-direction: row;
        background-color: #23272a;
        box-shadow: #00000059 0 5px 15px;
        transition: opacity 1s ease 0s, transform 1s ease 0s;
        top: 0;
        z-index: 10;
        width: 100%;
        align-items: center;

        img {
        width: 5rem;
        padding-top: 1rem;
        margin-left: 2.5rem;
        }

        nav {
            min-height: 10vh;
            margin: auto;
            width: 90%;
            display: flex;
            align-items: center;
            justify-content: space-between;

            ul {
                width: 100%;
                list-style: none;
                display: flex;
                justify-content: flex-end;
                align-items: center;

                li {
                    padding: 0 1rem;
                    font-size: 1.2rem;
                    font-weight: 500;
                    font-family: 'Ubuntu', sans-serif;
                    letter-spacing: 0.1rem;
                    text-transform: uppercase;
                    
                    a {
                        text-decoration: none;
                        color: #b288c0;
                        transition: color 0.3s ease;

                        &:hover {
                            color: #63458a;
                        }
                    }
                }
            }
        }
    }

    @media screen and (max-width: 768px) {
        header {
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 1rem 0;

            img {
                margin: 0;
            }

            nav {
                display: none;
            }
        }
    }
</style>