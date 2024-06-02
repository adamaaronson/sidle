import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import '../styles/Header.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';

export default function Header() {
    return (
        <header className="header">
            <button className="about-button">
                <FontAwesomeIcon icon={faQuestionCircle} />
            </button>
            <button className="settings-button">
                <FontAwesomeIcon icon={faGear} />
            </button>
        </header>
    );
}
