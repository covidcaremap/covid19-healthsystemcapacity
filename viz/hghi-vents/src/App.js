import React, { useState } from 'react';
import { Layout, Select, Modal } from 'antd';
import {InfoCircleOutlined} from '@ant-design/icons';
import './App.css';
import 'antd/dist/antd.css';
import 'leaflet/dist/leaflet.css';

import Map from './Map';
import {displayAttrs} from './utils';

const { Header, Content } = Layout;
const { Option } = Select;

const attributeOptions = displayAttrs.map(attr =>  <Option key={attr} value={attr}>{attr}</Option>);


function App() {
  const [activeAttr, setActiveAttr] = useState(displayAttrs[0]);

  const handleChange = (value) => {
    setActiveAttr(value);
  }

  const info = () => {
    Modal.info({
          title:"About",
          content: ( 
            <div>
            <p>
              Ventilator data from:<br/> <a href="https://www.ncbi.nlm.nih.gov/pubmed/21149215">https://www.ncbi.nlm.nih.gov/pubmed/21149215</a>
              <br/>
              Capacity data from:<br/> <a href="https://globalepidemics.org/2020/03/17/caring-for-covid-19-patients/">https://globalepidemics.org/2020/03/17/caring-for-covid-19-patients/</a>
              <br/>
              Census data from:<br/> <a href="https://www.census.gov/data/tables/time-series/demo/popest/2010s-counties-detail.html">https://www.census.gov/data/tables/time-series/demo/popest/2010s-counties-detail.html</a>
              <br/>
            </p>
            <hr/>
            <p>
              Source code and methodology can be found here: <br/>
              <a href="https://github.com/daveluo/covid19-healthsystemcapacity">https://github.com/daveluo/covid19-healthsystemcapacity</a>
            </p>
            </div>
          ),
          onOk() {},
    })
  }

  return (
    <div className="App">
      <Layout style={{height: "100vh"}}>
        <Header className="header" >
          <h2 style={{color: 'white'}}>
            Ventilator Supply and Healthcare Capacity Map, by State 
            &nbsp;<InfoCircleOutlined onClick={info}/>
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
          <Map activeAttribute={activeAttr}/>
        </Content>
      </Layout>
      </Layout>
    </div>
  );
}

export default App;
