import './App.css'
import Header from "./components/Header/Header.tsx";
import ColumnsManager from "./components/ColumnsManager/ColumnsManager.tsx";

function App() {
    return (
        <div className='main-wrapper'>
            <Header />
            <ColumnsManager />
        </div>
    );
}

export default App
