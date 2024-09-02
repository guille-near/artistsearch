import axios from 'axios';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
let accessToken = null;
let tokenExpirationTime = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpirationTime) {
    return accessToken;
  }

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    accessToken = response.data.access_token;
    tokenExpirationTime = Date.now() + (response.data.expires_in * 1000);
    return accessToken;
  } catch (error) {
    console.error('Error obtaining Spotify access token:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const token = await getAccessToken();
    const response = await axios.get(`https://api.spotify.com/v1/search?type=artist&q=${encodeURIComponent(q)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const artists = response.data.artists.items.map(artist => ({
      id: artist.id,
      name: artist.name,
      followers: artist.followers.total,
      monthlyListeners: artist.popularity * 1000, // Aproximación basada en popularidad
      image: artist.images[0]?.url || '/api/placeholder/100/100'
    }));

    res.status(200).json(artists);
  } catch (error) {
    console.error('Error searching artists:', error);
    res.status(500).json({ error: 'An error occurred while searching for artists' });
  }
}