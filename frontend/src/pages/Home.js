// react core
import React from 'react';
import ReactSVG from 'react-svg';

// css
import './Home.css';
import DevNet from './devnet.svg'

function Home(props) {
    console.log(props);
    return (
        <div className="Home">
            <ReactSVG src={DevNet} />
        </div>
    )
}

export default Home;