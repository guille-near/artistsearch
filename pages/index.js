import React, { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [artists, setArtists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const searchArtists = async () => {
      if (searchTerm.length > 1) {
        setIsLoading(true);
        setError('');
        try {
          const response = await fetch(`/api/search-artists?q=${encodeURIComponent(searchTerm)}`);
          if (!response.ok) throw new Error('Problema al buscar artistas');
          const data = await response.json();
          setArtists(data);
        } catch (err) {
          setError('Error al buscar artistas. Por favor, intenta de nuevo.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setArtists([]);
      }
    };

    const debounceTimer = setTimeout(searchArtists, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  return (
    <div className="container">
      <Head>
        <title>Buscador de Artistas de Spotify</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">Búsqueda de Artistas de Spotify</h1>

        <input
          type="text"
          placeholder="Buscar artistas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        {isLoading && <p>Cargando...</p>}
        {error && <p className="error">{error}</p>}

        <div className="artist-grid">
          {artists.map((artist) => (
            <div key={artist.id} className="artist-card">
              <img src={artist.image} alt={artist.name} className="artist-image" />
              <div className="artist-info">
                <h3>{artist.name}</h3>
                <p>Seguidores: {artist.followers.toLocaleString()}</p>
                <p>Oyentes mensuales: {artist.monthlyListeners.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
          max-width: 800px;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
          text-align: center;
          margin-bottom: 2rem;
        }

        .search-input {
          width: 100%;
          padding: 0.5rem;
          font-size: 1rem;
          margin-bottom: 2rem;
        }

        .artist-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          width: 100%;
        }

        .artist-card {
          border: 1px solid #eaeaea;
          border-radius: 10px;
          padding: 1rem;
          transition: color 0.15s ease, border-color 0.15s ease;
        }

        .artist-image {
          width: 100%;
          height: auto;
          border-radius: 5px;
          margin-bottom: 0.5rem;
        }

        .artist-info h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.2rem;
        }

        .artist-info p {
          margin: 0;
          font-size: 0.9rem;
          color: #666;
        }

        .error {
          color: red;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}