import { BrowserRouter, Routes, Route } from 'react-router-dom';
import type { ReactNode } from 'react';
import Header from './components/header/Header';
import Landing from './components/landing/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Overview from './pages/dashboard/Overview';
import MapView from './pages/dashboard/MapView';
import AddChannel from './pages/dashboard/AddChannel';
import ChannelsList from './pages/dashboard/ChannelsList';
import ChannelsChart from './pages/dashboard/ChannelsChart';
import Weather from './pages/dashboard/Weather';
import Profile from './pages/dashboard/Profile';
import './App.css';

function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <Layout>
              <Landing />
            </Layout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        >
          <Route index element={<Overview />} />
          <Route path="map" element={<MapView />} />
          <Route path="add-channel" element={<AddChannel />} />
          <Route path="channels" element={<ChannelsList />} />
          <Route path="chart" element={<ChannelsChart />} />
          <Route path="weather" element={<Weather />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route
          path="*"
          element={
            <Layout>
              <Landing />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
