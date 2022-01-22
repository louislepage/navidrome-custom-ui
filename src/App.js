import React, { useEffect } from 'react'
import ReactGA from 'react-ga'
import { Provider } from 'react-redux'
import { createHashHistory } from 'history'
import { Admin as RAAdmin, Resource } from 'react-admin'
import { HotKeys } from 'react-hotkeys'
import dataProvider from './dataProvider'
import authProvider from './authProvider'
import { Layout, Login, Logout } from './layout'
import transcoding from './transcoding'
import player from './player'
import user from './user'
import song from './song'
import album from './album'
import artist from './artist'
import playlist from './playlist'
import { Player } from './audioplayer'
import customRoutes from './routes'
import {
  themeReducer,
  addToPlaylistDialogReducer,
  expandInfoDialogReducer,
  listenBrainzTokenDialogReducer,
  playerReducer,
  albumViewReducer,
  activityReducer,
  settingsReducer,
} from './reducers'
import createAdminStore from './store/createAdminStore'
import { i18nProvider } from './i18n'
import config from './config'
import { setDispatch, startEventStream, stopEventStream } from './eventStream'
import { keyMap } from './hotkeys'
import useChangeThemeColor from './useChangeThemeColor'

const history = createHashHistory()

if (config.gaTrackingId) {
  ReactGA.initialize(config.gaTrackingId)
  history.listen((location) => {
    ReactGA.pageview(location.pathname)
  })
  ReactGA.pageview(window.location.pathname)
}

const adminStore = createAdminStore({
  authProvider,
  dataProvider,
  history,
  customReducers: {
    player: playerReducer,
    albumView: albumViewReducer,
    theme: themeReducer,
    addToPlaylistDialog: addToPlaylistDialogReducer,
    expandInfoDialog: expandInfoDialogReducer,
    listenBrainzTokenDialog: listenBrainzTokenDialogReducer,
    activity: activityReducer,
    settings: settingsReducer,
  },
})

const App = () => (
  <Provider store={adminStore}>
    <Admin />
  </Provider>
)

const Admin = (props) => {
  useChangeThemeColor()
  useEffect(() => {
    if (config.devActivityPanel) {
      setDispatch(adminStore.dispatch)
      authProvider
        .checkAuth()
        .then(() => startEventStream(adminStore.dispatch))
        .catch(() => {})
    }
    return () => {
      stopEventStream()
    }
  }, [])

  return (
    <RAAdmin
      disableTelemetry
      dataProvider={dataProvider}
      authProvider={authProvider}
      i18nProvider={i18nProvider}
      customRoutes={customRoutes}
      history={history}
      layout={Layout}
      loginPage={Login}
      logoutButton={Logout}
      {...props}
    >
      {(permissions) => [
        <Resource name="album" {...album} options={{ subMenu: 'albumList' }} />,
        <Resource name="artist" {...artist} />,
        <Resource name="song" {...song} />,
        <Resource
          name="playlist"
          {...playlist}
          options={{ subMenu: 'playlist' }}
        />,
        <Resource name="user" {...user} options={{ subMenu: 'settings' }} />,
        <Resource
          name="player"
          {...player}
          options={{ subMenu: 'settings' }}
        />,
        permissions === 'admin' ? (
          <Resource
            name="transcoding"
            {...transcoding}
            options={{ subMenu: 'settings' }}
          />
        ) : (
          <Resource name="transcoding" />
        ),
        <Resource name="translation" />,
        <Resource name="genre" />,
        <Resource name="playlistTrack" />,
        <Resource name="keepalive" />,
        <Player />,
      ]}
    </RAAdmin>
  )
}

const AppWithHotkeys = () => (
  <HotKeys keyMap={keyMap}>
    <App />
  </HotKeys>
)

export default AppWithHotkeys
