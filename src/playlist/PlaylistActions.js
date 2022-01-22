import React from 'react'
import { useDispatch } from 'react-redux'
import {
  Button,
  sanitizeListRestProps,
  TopToolbar,
  useTranslate,
  useDataProvider,
  useNotify,
} from 'react-admin'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import ShuffleIcon from '@material-ui/icons/Shuffle'
import CloudDownloadOutlinedIcon from '@material-ui/icons/CloudDownloadOutlined'
import { RiPlayListAddFill, RiPlayList2Fill } from 'react-icons/ri'
import QueueMusicIcon from '@material-ui/icons/QueueMusic'
import { httpClient } from '../dataProvider'
import { playNext, addTracks, playTracks, shuffleTracks } from '../actions'
import { M3U_MIME_TYPE, REST_URL } from '../consts'
import subsonic from '../subsonic'
import PropTypes from 'prop-types'
import { formatBytes } from '../utils'
import { useMediaQuery, makeStyles } from '@material-ui/core'
import config from '../config'
import { ToggleFieldsMenu } from '../common'

const useStyles = makeStyles({
  toolbar: { display: 'flex', justifyContent: 'space-between', width: '100%' },
})

const PlaylistActions = ({ className, ids, data, record, ...rest }) => {
  const dispatch = useDispatch()
  const translate = useTranslate()
  const classes = useStyles()
  const dataProvider = useDataProvider()
  const notify = useNotify()
  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up('md'))
  const isNotSmall = useMediaQuery((theme) => theme.breakpoints.up('sm'))

  const getAllSongsAndDispatch = React.useCallback(
    (action) => {
      if (ids?.length === record.songCount) {
        return dispatch(action(data, ids))
      }

      dataProvider
        .getList('playlistTrack', {
          pagination: { page: 1, perPage: 0 },
          sort: { field: 'id', order: 'ASC' },
          filter: { playlist_id: record.id },
        })
        .then((res) => {
          const data = res.data.reduce(
            (acc, curr) => ({ ...acc, [curr.id]: curr }),
            {}
          )
          dispatch(action(data))
        })
        .catch(() => {
          notify('ra.page.error', 'warning')
        })
    },
    [dataProvider, dispatch, record, data, ids, notify]
  )

  const handlePlay = React.useCallback(() => {
    getAllSongsAndDispatch(playTracks)
  }, [getAllSongsAndDispatch])

  const handlePlayNext = React.useCallback(() => {
    getAllSongsAndDispatch(playNext)
  }, [getAllSongsAndDispatch])

  const handlePlayLater = React.useCallback(() => {
    getAllSongsAndDispatch(addTracks)
  }, [getAllSongsAndDispatch])

  const handleShuffle = React.useCallback(() => {
    getAllSongsAndDispatch(shuffleTracks)
  }, [getAllSongsAndDispatch])

  const handleDownload = React.useCallback(() => {
    subsonic.download(record.id)
  }, [record])

  const handleExport = React.useCallback(
    () =>
      httpClient(`${REST_URL}/playlist/${record.id}/tracks`, {
        headers: new Headers({ Accept: M3U_MIME_TYPE }),
      }).then((res) => {
        const blob = new Blob([res.body], { type: M3U_MIME_TYPE })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${record.name}.m3u`
        document.body.appendChild(link)
        link.click()
        link.parentNode.removeChild(link)
      }),
    [record]
  )

  return (
    <TopToolbar className={className} {...sanitizeListRestProps(rest)}>
      <div className={classes.toolbar}>
        <div>
          <Button
            onClick={handlePlay}
            label={translate('resources.album.actions.playAll')}
          >
            <PlayArrowIcon />
          </Button>
          <Button
            onClick={handleShuffle}
            label={translate('resources.album.actions.shuffle')}
          >
            <ShuffleIcon />
          </Button>
          <Button
            onClick={handlePlayNext}
            label={translate('resources.album.actions.playNext')}
          >
            <RiPlayList2Fill />
          </Button>
          <Button
            onClick={handlePlayLater}
            label={translate('resources.album.actions.addToQueue')}
          >
            <RiPlayListAddFill />
          </Button>
          {config.enableDownloads && (
            <Button
              onClick={handleDownload}
              label={
                translate('resources.album.actions.download') +
                (isDesktop ? ` (${formatBytes(record.size)})` : '')
              }
            >
              <CloudDownloadOutlinedIcon />
            </Button>
          )}
          <Button
            onClick={handleExport}
            label={translate('resources.playlist.actions.export')}
          >
            <QueueMusicIcon />
          </Button>
        </div>
        <div>{isNotSmall && <ToggleFieldsMenu resource="playlistTrack" />}</div>
      </div>
    </TopToolbar>
  )
}

PlaylistActions.propTypes = {
  record: PropTypes.object.isRequired,
  selectedIds: PropTypes.arrayOf(PropTypes.number),
}

PlaylistActions.defaultProps = {
  record: {},
  selectedIds: [],
  onUnselectItems: () => null,
}

export default PlaylistActions
