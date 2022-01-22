// These defaults are only used in development mode. When bundled in the app,
// the __APP_CONFIG__ object is dynamically filled by the ServeIndex function,
// in the /server/app/serve_index.go
const defaultConfig = {
  version: 'dev',
  firstTime: false,
  baseURL: '',
  variousArtistsId: '03b645ef2100dfc42fa9785ea3102295', // See consts.VariousArtistsID in consts.go
  // Login backgrounds from https://unsplash.com/collections/1065384/music-wallpapers
  loginBackgroundURL:
    'https://images.unsplash.com/photo-1626126525134-fbbc07afb32c?fm=jpg&w=1600&h=900',
  enableTranscodingConfig: true,
  enableDownloads: true,
  enableFavourites: true,
  losslessFormats: 'FLAC,WAV,ALAC,DSF',
  welcomeMessage: '',
  gaTrackingId: '',
  devActivityPanel: true,
  devFastAccessCoverArt: false,
  enableStarRating: true,
  defaultTheme: 'Spotify-ish',
  enableUserEditing: true,
  devEnableShare: true,
  devSidebarPlaylists: true,
  lastFMEnabled: true,
  lastFMApiKey: '9b94a5515ea66b2da3ec03c12300327e',
  listenBrainzEnabled: true,
  enableCoverAnimation: true,
  devShowArtistPage: true,
}

let config

try {
  const appConfig = JSON.parse(window.__APP_CONFIG__)

  config = {
    ...defaultConfig,
    ...appConfig,
  }
} catch (e) {
  config = defaultConfig
}

export default config
