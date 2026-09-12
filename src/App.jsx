// src/App.jsx
import Listings from './pages/Listings';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';

// Placeholder pages — replaced one at a time as we build each screen
function Placeholder({ name }) {
  return <p className="text-muted">{name} screen — coming next.</p>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Listings />} />
            <Route path="/listings/:id" element={<Placeholder name="Listing detail" />} />
            <Route path="/rentals" element={<Placeholder name="Rentals" />} />
            <Route path="/projects" element={<Placeholder name="Projects" />} />
            <Route path="/favourites" element={<Placeholder name="Saved listings" />} />
            <Route path="/insights" element={<Placeholder name="Insights" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
