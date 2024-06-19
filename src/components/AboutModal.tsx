export default function AboutModal() {
    return (
        <div>
            <p>
                Sidle was designed and developed by{' '}
                <a href="https://x.com/aaaronson" target="_blank" rel="noopener noreferrer">
                    Adam Aaronson
                </a>
                . It came to him in a dream. Or not quite a dream, but not a fully waking state either. To learn more,{' '}
                <a href="https://youtu.be/1wnE4vF9CQ4" target="_blank" rel="noopener noreferrer">
                    read the blog post!
                </a>
            </p>

            <p>
                Love the game?{' '}
                <a href="https://buymeacoffee.com/aaronson" target="_blank" rel="noopener noreferrer">
                    Buy me a coffee!
                </a>
            </p>

            <p className="copyright-message">
                © {new Date().getFullYear()} Adam Aaronson, all rights reserved. Not affiliated with any other games
                that might happen to end in the suffix "-dle".
            </p>
        </div>
    );
}
