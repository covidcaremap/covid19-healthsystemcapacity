import React from 'react';
import { Layout } from 'antd';
import './App.css';
import 'antd/dist/antd.css';
import 'leaflet/dist/leaflet.css';

import Map from './Map';

const { Header, Content } = Layout;

function App() {
  return (
    <div className="App">
      <Layout style={{height: "100vh"}}>
        <Header className="header"></Header>
      <Layout style={{ padding: '0 2px 2px' }}>
        <Content
          className="site-layout-background"
          style={{
            padding: 2,
            margin: 0,
            minHeight: 280,
          }}
          >
          <Map/>
        </Content>
      </Layout>
      </Layout>
    </div>
  );
}

export default App;
