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

    return (
        <div className="app">
            <Header onOpenAbout={() => setAboutModal(true)} onOpenSettings={() => setSettingsModal(true)} />
            {aboutModal && (
                <Modal title="About" onClose={() => setAboutModal(false)}>
                    <></>
                </Modal>
            )}
            {settingsModal && (
                <Modal title="Settings" onClose={() => setSettingsModal(false)}>
                    <SettingsModal darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
                </Modal>
            )}
            <Game />
        </div>
    );
}

export default App;
