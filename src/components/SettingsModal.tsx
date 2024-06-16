import { useState } from 'react';
import '../styles/SettingsModal.scss';
import Modal from './Modal';

interface Props {
    darkMode: boolean;
    highContrastMode: boolean;
    iMessageMode: boolean;
    controlButtons: boolean;
    toggleDarkMode: () => void;
    toggleHighContrastMode: () => void;
    toggleIMessageMode: () => void;
    toggleControlButtons: () => void;
    onRestartProgress: () => void;
}

export default function SettingsModal({
    darkMode,
    highContrastMode,
    iMessageMode,
    controlButtons,
    toggleDarkMode,
    toggleHighContrastMode,
    toggleIMessageMode,
    toggleControlButtons,
    onRestartProgress,
}: Props) {
    const [restartingProgress, setRestartingProgress] = useState(false);

    const restartProgress = () => {
        setRestartingProgress(false);
        onRestartProgress();
    };

    return (
        <div className="settings-list">
            <div className="settings-row">
                <label className="settings-label" htmlFor="dark-mode-checkbox">
                    Emoji dark mode
                </label>
                <input
                    id="dark-mode-checkbox"
                    type="checkbox"
                    defaultChecked={darkMode}
                    onChange={() => toggleDarkMode()}
                />
            </div>
            <div className="settings-row">
                <label className="settings-label" htmlFor="high-contrast-mode-checkbox">
                    High contrast mode
                </label>
                <input
                    id="high-contrast-mode-checkbox"
                    type="checkbox"
                    defaultChecked={highContrastMode}
                    onChange={() => toggleHighContrastMode()}
                />
            </div>
            <div className="settings-row">
                <label className="settings-label" htmlFor="imessage-mode-checkbox">
                    iMessage mode
                </label>
                <input
                    id="imessage-mode-checkbox"
                    type="checkbox"
                    defaultChecked={iMessageMode}
                    onChange={() => toggleIMessageMode()}
                />
            </div>
            <div className="settings-row">
                <label className="settings-label" htmlFor="control-buttons-checkbox">
                    Show touch screen buttons
                </label>
                <input
                    id="control-buttons-checkbox"
                    type="checkbox"
                    defaultChecked={controlButtons}
                    onChange={() => toggleControlButtons()}
                />
            </div>
            <div className="settings-row">
                <button className="restart-button" onClick={() => setRestartingProgress(true)}>
                    Restart progress
                </button>
                {restartingProgress && (
                    <Modal title="Are you sure?" onClose={() => setRestartingProgress(false)} layer={2}>
                        <p>This action cannot be undone!</p>
                        <button className="restart-button" onClick={restartProgress}>
                            Sigh... yes I'm sure
                        </button>
                    </Modal>
                )}
            </div>
        </div>
    );
}
