import { useState } from 'react';
import '../styles/App.scss';
import Game from './Game';
import Header from './Header';
import Modal from './Modal';
import SettingsModal from './SettingsModal';

function App() {
    const [aboutModal, setAboutModal] = useState(false);
    const [settingsModal, setSettingsModal] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const [highContrastMode, setHighContrastMode] = useState(false);
    const [controlButtons, setControlButtons] = useState(false);
    const [levelIndex, setLevelIndex] = useState(0);

    const modalOpen = aboutModal || settingsModal;

    return (
        <div className={'app' + (modalOpen ? ' modal-open' : '')}>
            <Header onOpenAbout={() => setAboutModal(true)} onOpenSettings={() => setSettingsModal(true)} />
            {aboutModal && (
                <Modal title="About" onClose={() => setAboutModal(false)}>
                    <></>
                </Modal>
            )}
            {settingsModal && (
                <Modal title="Settings" onClose={() => setSettingsModal(false)}>
                    <SettingsModal
                        darkMode={darkMode}
                        highContrastMode={highContrastMode}
                        controlButtons={controlButtons}
                        toggleDarkMode={() => setDarkMode(!darkMode)}
                        toggleHighContrastMode={() => setHighContrastMode(!highContrastMode)}
                        toggleControlButtons={() => setControlButtons(!controlButtons)}
                        onRestartProgress={() => {
                            setSettingsModal(false);
                            setLevelIndex(0);
                        }}
                    />
                </Modal>
            )}
            <Game levelIndex={levelIndex} onChangeLevel={(newLevelIndex: number) => setLevelIndex(newLevelIndex)} />
        </div>
    );
}

export default App;
