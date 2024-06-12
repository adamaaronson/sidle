import '../styles/Header.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faQuestion, faShareAlt } from '@fortawesome/free-solid-svg-icons';

interface Props {
    onShare: () => void;
    onOpenAbout: () => void;
    onOpenSettings: () => void;
}

export default function Header({ onShare, onOpenAbout, onOpenSettings }: Props) {
    return (
        <header className="header">
            <button className="share-button fancy-button" onClick={onShare}>
                <span className="share-label">Share</span>
                <FontAwesomeIcon className="share-icon" icon={faShareAlt} />
            </button>
            <button className="round-button fancy-button" onClick={onOpenAbout}>
                <FontAwesomeIcon icon={faQuestion} />
            </button>
            <button className="settings-button" onClick={onOpenSettings}>
                <FontAwesomeIcon icon={faGear} />
            </button>
        </header>
    );
}
