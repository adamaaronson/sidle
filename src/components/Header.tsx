import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import '../styles/Header.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';

interface Props {
    onOpenAbout: () => void;
    onOpenSettings: () => void;
}

export default function Header({ onOpenAbout, onOpenSettings }: Props) {
    return (
        <header className="header">
            <button className="about-button" onClick={onOpenAbout}>
                <FontAwesomeIcon icon={faQuestionCircle} />
            </button>
            <button className="settings-button" onClick={onOpenSettings}>
                <FontAwesomeIcon icon={faGear} />
            </button>
        </header>
    );
}
