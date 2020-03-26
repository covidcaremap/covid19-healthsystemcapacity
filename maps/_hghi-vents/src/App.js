import React, { useState } from 'react';
import { Layout, Select, Modal } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import './App.css';
import 'antd/dist/antd.css';
import 'leaflet/dist/leaflet.css';

import Map from './Map';
import { displayAttrs } from './utils';

const { Header, Content } = Layout;
const { Option } = Select;

const attributeOptions = displayAttrs.map(attr => (
    <Option key={attr} value={attr}>
        {attr}
    </Option>
));

function App() {
    const [activeAttr, setActiveAttr] = useState(displayAttrs[0]);

    const handleChange = value => {
        setActiveAttr(value);
    };

    const info = () => {
        Modal.info({
            title: 'About',
            content: (
                <div>
                    <p>
                        Map visualization created by{' '}
                        <a href="https://github.com/mmcfarland">
                            Matt McFarland{' '}
                        </a>
                        with support from{' '}
                        <a href="https://azavea.com">Azavea</a>,{' '}
                        <a href="https://www.covidcaremap.org">
                            COVID Care Map team
                        </a>
                    </p>
                    <strong>Data Sources:</strong>
                    <ul>
                        <li>
                            Estimated No. of Full-Featured Mechanical
                            Ventilators data from Rubinson 2010 study on{' '}
                            <a href="https://www.cambridge.org/core/journals/disaster-medicine-and-public-health-preparedness/article/mechanical-ventilators-in-us-acute-care-hospitals/F1FDBACA53531F2A150D6AD8E96F144D">
                                Mechanical Ventilators in US Acute Care
                                Hospitals, TABLE 4: Quantities of Full-Feature
                                Ventilators per Population, by State
                            </a>
                        </li>
                        <li>
                            Health System Capacity data
                            ("Total/Available/Potentially Available ___ Beds")
                            from{' '}
                            <a href="https://globalepidemics.org/2020/03/17/caring-for-covid-19-patients/">
                                Harvard Global Health Institute's regionalized
                                capacity estimates
                            </a>
                        </li>
                        <li>
                            Per capita calculation of health system capacity
                            ("___ Beds per 100,000 people") using{' '}
                            <a href="https://www.census.gov/data/tables/time-series/demo/popest/2010s-counties-detail.html">
                                2018 US Census Bureau population estimate by
                                state
                            </a>
                        </li>
                    </ul>{' '}
                    <hr />
                    More info, methodology & source code can be found at:
                    <ul>
                        <li>
                            <a href="https://www.covidcaremap.org">
                                CovidCareMap.org
                            </a>
                        </li>
                        <li>
                            <a href="https://github.com/covidcaremap/covid19-healthsystemcapacity/">
                                CovidCareMap GitHub page
                            </a>
                        </li>
                    </ul>
                </div>
            ),
            onOk() {},
        });
    };

    return (
        <div className="App">
            <Layout style={{ height: '100vh' }}>
                <Header className="header">
                    <h2 style={{ color: 'white' }}>
                        Ventilator Supply and Healthcare Capacity Map, by State
                        &nbsp;
                        <InfoCircleOutlined onClick={info} />
                    </h2>
                </Header>
                <Layout style={{ padding: '0 2px 2px' }}>
                    <strong>Select an attribute:</strong>
                    <Select
                        dropdownMatchSelectWidth={false}
                        size="large"
                        defaultValue={displayAttrs[0]}
                        onChange={handleChange}
                    >
                        {attributeOptions}
                    </Select>
                    <Content
                        className="site-layout-background"
                        style={{
                            padding: 2,
                            margin: 0,
                            minHeight: 280,
                        }}
                    >
                        <Map activeAttribute={activeAttr} />
                    </Content>
                </Layout>
            </Layout>
        </div>
    );
}

export default App;
