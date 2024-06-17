export default function AboutModal() {
    return (
        <div>
            <p>
                Sidle was designed and developed by{' '}
                <a href="https://aaronson.org" target="_blank" rel="noopener noreferrer">
                    Adam Aaronson
                </a>
                . It came to him in a dream. Or not quite a dream, but a hypnagogic state.
            </p>

            <p>
                To learn more, read{' '}
                <a href="https://youtu.be/1wnE4vF9CQ4" target="_blank" rel="noopener noreferrer">
                    the blog post!
                </a>
            </p>

            <p className="copyright-message">
                © {new Date().getFullYear()} Adam Aaronson, all rights reserved. Not affiliated with any other games
                that might happen to end in the suffix "-dle".
            </p>
        </div>
    );
}
