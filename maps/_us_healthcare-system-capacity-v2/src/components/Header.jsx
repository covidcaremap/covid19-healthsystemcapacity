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
                        alt="COVIDCareMap"
                    />
                </a>
            </div>
            <nav>
                <NewTabLink
                    href="https://forms.gle/KJsEjqgxkWn6xWRn8"
                    text="Update data"
                ></NewTabLink>
                <NewTabLink
                    href="https://www.covidcaremap.org/"
                    text="About/Methodology"
                ></NewTabLink>
                <NewTabLink
                    href="https://github.com/covidcaremap/covid19-healthsystemcapacity"
                    text="Github"
                ></NewTabLink>
                <NewTabLink
                    href="https://www.covidcaremap.org/#data"
                    text="Download data"
                ></NewTabLink>
            </nav>
        </div>
    );
}
