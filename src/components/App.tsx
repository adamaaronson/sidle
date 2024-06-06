import { useEffect, useState } from 'react';
import '../styles/App.scss';
import Game from './Game';
import Header from './Header';
import Modal from './Modal';
import SettingsModal from './SettingsModal';

function getLocalStorageBoolean(key: string, defaultValue: boolean) {
    const localStorageValue = localStorage.getItem(key);
    return localStorageValue ? localStorageValue === 'true' : defaultValue;
}

function App() {
    const [aboutModal, setAboutModal] = useState(false);
    const [settingsModal, setSettingsModal] = useState(false);

    const [darkMode, setDarkMode] = useState(getLocalStorageBoolean('darkMode', true));
    const [highContrastMode, setHighContrastMode] = useState(getLocalStorageBoolean('highContrastMode', false));
    const [iMessageMode, setIMessageMode] = useState(getLocalStorageBoolean('iMessageMode', true));
    const [controlButtons, setControlButtons] = useState(getLocalStorageBoolean('controlButtons', false));
    const [levelIndex, setLevelIndex] = useState(parseInt(localStorage.getItem('levelIndex') || '0'));

    const modalOpen = aboutModal || settingsModal;

    useEffect(() => {
        localStorage.setItem('darkMode', darkMode.toString());
    }, [darkMode]);

    useEffect(() => {
        localStorage.setItem('highContrastMode', highContrastMode.toString());
    }, [highContrastMode]);

    useEffect(() => {
        localStorage.setItem('iMessageMode', iMessageMode.toString());
    }, [iMessageMode]);

    useEffect(() => {
        localStorage.setItem('controlButtons', controlButtons.toString());
    }, [controlButtons]);

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
                        iMessageMode={iMessageMode}
                        controlButtons={controlButtons}
                        toggleDarkMode={() => setDarkMode(!darkMode)}
                        toggleHighContrastMode={() => setHighContrastMode(!highContrastMode)}
                        toggleIMessageMode={() => setIMessageMode(!iMessageMode)}
                        toggleControlButtons={() => setControlButtons(!controlButtons)}
                        onRestartProgress={() => {
                            setSettingsModal(false);
                            setLevelIndex(0);
                        }}
                    />
                </Modal>
            )}
            <Game
                levelIndex={levelIndex}
                onChangeLevel={(newLevelIndex: number) => setLevelIndex(newLevelIndex)}
                darkMode={darkMode}
                highContrastMode={highContrastMode}
                iMessageMode={iMessageMode}
            />
        </div>
    );
}

export default App;
