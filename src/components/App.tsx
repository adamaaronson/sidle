import '../styles/App.scss';
import Game from './Game';

function App() {
    console.log('app render');
    return (
        <div className="app">
            <Game />
        </div>
    );
}

export default App;
