import React from 'react'
import { useRecordContext, useTranslate } from 'react-admin'
import { IconButton, Tooltip, Link } from '@material-ui/core'
import { ImLastfm2 } from 'react-icons/im'
import MusicBrainz from '../icons/MusicBrainz'
import { intersperse } from '../utils'

const AlbumExternalLinks = (props) => {
  const { className } = props
  const translate = useTranslate()
  const record = useRecordContext(props)
  let links = []

  const addLink = (url, title, icon) => {
    const translatedTitle = translate(title)
    const link = (
      <Link href={url} target="_blank" rel="noopener noreferrer">
        <Tooltip title={translatedTitle}>
          <IconButton size={'small'} aria-label={translatedTitle}>
            {icon}
          </IconButton>
        </Tooltip>
      </Link>
    )
    const id = links.length
    links.push(<span key={`link-${record.id}-${id}`}>{link}</span>)
  }

  addLink(
    `https://last.fm/music/${
      encodeURIComponent(record.albumArtist) +
      '/' +
      encodeURIComponent(record.name)
    }`,
    'message.openIn.lastfm',
    <ImLastfm2 />
  )

  record.mbzAlbumId &&
    addLink(
      `https://musicbrainz.org/release/${record.mbzAlbumId}`,
      'message.openIn.musicbrainz',
      <MusicBrainz />
    )

  return <div className={className}>{intersperse(links, ' ')}</div>
}

export default AlbumExternalLinks
