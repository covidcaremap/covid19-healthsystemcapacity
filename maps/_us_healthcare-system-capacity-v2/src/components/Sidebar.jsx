import React from 'react';
import NewTabLink from './NewTabLink';

export default function Sidebar({ indicator, onIndicatorChanged }) {
    const handleIndicatorChanged = indicatorId => {
        return () => onIndicatorChanged(indicatorId);
    };

    return (
        <div className="sidebar">
            <div className="content">
                <p className="large">
                    Open map data on US health system capacity to care for
                    COVID-19 patients
                </p>
                <p>
                    We use open data to provide a recent view of the US health
                    system's capacity to care for hospitalized COVID-19
                    patients.
                    <a href="https://www.covidcaremap.org/">
                        See our project
                    </a>{' '}
                    for methods, sources, data, and code - all free and
                    open-source.
                </p>
                <p>
                    <strong>NOTE:</strong> Numbers are not reported in
                    real-time. They are from 2018 facility reports or prior and
                    may be incomplete or outdated. With your help, we are
                    updating this data to create a more current view.{' '}
                    <NewTabLink
                        href="https://forms.gle/KJsEjqgxkWn6xWRn8"
                        text="Correct, update, or add data."
                    ></NewTabLink>
                </p>
                <hr />
                <div className="map-options menu" id="indicator">
                    <button
                        className={indicator === 0 ? 'active' : ''}
                        onClick={handleIndicatorChanged(0)}
                    >
                        <div
                            className="button-icon"
                            style={{ color: '#023858' }}
                        >
                            <i className="icon-eye"></i>
                            <i className="icon-eye-off"></i>
                        </div>
                        <div className="button-text">
                            <div className="button-label">Staffed All Beds</div>
                            <div className="button-description">
                                Number of all hospital beds typically set up and
                                staffed for inpatient care
                            </div>
                        </div>
                    </button>
                    <button
                        className={indicator === 1 ? 'active' : ''}
                        onClick={handleIndicatorChanged(1)}
                    >
                        <div
                            className="button-icon"
                            style={{ color: '#4d004b' }}
                        >
                            <i className="icon-eye"></i>
                            <i className="icon-eye-off"></i>
                        </div>
                        <div className="button-text">
                            <div className="button-label">Staffed ICU Beds</div>
                            <div className="button-description">
                                Number of ICU beds typically set up and staffed
                                for intensive inpatient care
                            </div>
                        </div>
                    </button>
                    <button
                        className={indicator === 2 ? 'active' : ''}
                        onClick={handleIndicatorChanged(2)}
                    >
                        <div
                            className="button-icon"
                            style={{ color: '#00441b' }}
                        >
                            <i className="icon-eye"></i>
                            <i className="icon-eye-off"></i>
                        </div>
                        <div className="button-text">
                            <div className="button-label">
                                Licensed All Beds
                            </div>
                            <div className="button-description">
                                Number of all hospital beds licensed for use
                            </div>
                        </div>
                    </button>
                    <button
                        className={indicator === 3 ? 'active' : ''}
                        onClick={handleIndicatorChanged(3)}
                    >
                        <div
                            className="button-icon"
                            style={{ color: '#6c2167' }}
                        >
                            <i className="icon-eye"></i>
                            <i className="icon-eye-off"></i>
                        </div>
                        <div className="button-text">
                            <div className="button-label">
                                All Bed Occupancy Rate
                            </div>
                            <div className="button-description">
                                Percent of all hospital beds typically occupied
                                by patients
                            </div>
                        </div>
                    </button>
                    <button
                        className={indicator === 4 ? 'active' : ''}
                        onClick={handleIndicatorChanged(4)}
                    >
                        <div
                            className="button-icon"
                            style={{ color: '#2a5675' }}
                        >
                            <i className="icon-eye"></i>
                            <i className="icon-eye-off"></i>
                        </div>
                        <div className="button-text">
                            <div className="button-label">
                                ICU Bed Occupancy Rate
                            </div>
                            <div className="button-description">
                                Percent of ICU beds typically occupied by
                                patients
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
