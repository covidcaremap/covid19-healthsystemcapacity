import React from 'react';
import NewTabLink from './NewTabLink';

export default function Header() {
    return (
        <div className="header">
            <div className="logo">
                <a href="https://www.covidcaremap.org/">
                    <img
                        src="/img/covidcaremap-logo.png"
                        height="18"
                        alt="CovidCareMap"
                    />
                </a>
            </div>
            <nav>
                <NewTabLink href="https://www.covidcaremap.org/">
                    About
                </NewTabLink>
                <NewTabLink href="https://github.com/covidcaremap/covid19-healthsystemcapacity">
                    Github
                </NewTabLink>
                <NewTabLink href="https://www.covidcaremap.org/#data">
                    Download data
                </NewTabLink>
                <NewTabLink href="https://forms.gle/KJsEjqgxkWn6xWRn8">
                    Update data
                </NewTabLink>
            </nav>
        </div>
    );
}
