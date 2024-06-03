import '../styles/SettingsModal.scss';

interface Props {
    darkMode: boolean;
    toggleDarkMode: () => void;
}

export default function SettingsModal({ darkMode, toggleDarkMode }: Props) {
    return (
        <div className="settings-list">
            <div className="settings-row">
                <label className="settings-label" htmlFor="dark-mode-checkbox">
                    Dark mode
                </label>
                <input
                    id="dark-mode-checkbox"
                    type="checkbox"
                    defaultChecked={darkMode}
                    onChange={() => toggleDarkMode()}
                />
            </div>
        </div>
    );
}
