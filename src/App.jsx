// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FavouritesProvider } from './context/FavouritesContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Listings from './pages/Listings';
import ListingDetail from './pages/ListingDetail';
import Rentals from './pages/Rentals';
import Projects from './pages/Projects';
import Favourites from './pages/Favourites';
import Insights from './pages/Insights';

export default function App() {
  return (
    <AuthProvider>
      <FavouritesProvider>
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
              <Route path="/listings/:id" element={<ListingDetail />} />
              <Route path="/rentals" element={<Rentals />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/favourites" element={<Favourites />} />
              <Route path="/insights" element={<Insights />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </FavouritesProvider>
    </AuthProvider>
  );
}
