import React, { useMemo, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardMedia,
  Collapse,
  makeStyles,
  Typography,
  useMediaQuery,
  withWidth,
} from '@material-ui/core'
import {
  useRecordContext,
  useTranslate,
  ArrayField,
  SingleFieldList,
  ChipField,
  Link,
} from 'react-admin'
import clsx from 'clsx'
import Lightbox from 'react-image-lightbox'
import 'react-image-lightbox/style.css'
import subsonic from '../subsonic'
import {
  ArtistLinkField,
  DurationField,
  formatRange,
  SizeField,
  LoveButton,
  RatingField,
  useAlbumsPerPage,
} from '../common'
import config from '../config'
import { intersperse } from '../utils'
import AlbumExternalLinks from './AlbumExternalLinks'

const useStyles = makeStyles(
  (theme) => ({
    root: {
      [theme.breakpoints.down('xs')]: {
        padding: '0.7em',
        minWidth: '20em',
      },
      [theme.breakpoints.up('sm')]: {
        padding: '1em',
        minWidth: '32em',
      },
    },
    cardContents: {
      display: 'flex',
    },
    details: {
      display: 'flex',
      flexDirection: 'column',
    },
    content: {
      flex: '2 0 auto',
    },
    coverParent: {
      [theme.breakpoints.down('xs')]: {
        height: '8em',
        width: '8em',
        minWidth: '8em',
      },
      [theme.breakpoints.up('sm')]: {
        height: '10em',
        width: '10em',
        minWidth: '10em',
      },
      [theme.breakpoints.up('lg')]: {
        height: '15em',
        width: '15em',
        minWidth: '15em',
      },
    },
    cover: {
      objectFit: 'contain',
      cursor: 'pointer',
      display: 'block',
      width: '100%',
      height: '100%',
    },
    loveButton: {
      top: theme.spacing(-0.2),
      left: theme.spacing(0.5),
    },
    commentBlock: {
      display: 'inline-block',
      marginTop: '1em',
      float: 'left',
      wordBreak: 'break-word',
    },
    pointerCursor: {
      cursor: 'pointer',
    },
    recordName: {},
    recordArtist: {},
    recordMeta: {},
    genreList: {
      marginTop: theme.spacing(0.5),
    },
    externalLinks: {
      marginTop: theme.spacing(1.5),
    },
  }),
  {
    name: 'NDAlbumDetails',
  }
)

const AlbumComment = ({ record }) => {
  const classes = useStyles()
  const [expanded, setExpanded] = React.useState(false)

  const lines = record.comment.split('\n')
  const formatted = useMemo(() => {
    return lines.map((line, idx) => (
      <span key={record.id + '-comment-' + idx}>
        <span dangerouslySetInnerHTML={{ __html: line }} />
        <br />
      </span>
    ))
  }, [lines, record.id])

  const handleExpandClick = useCallback(() => {
    setExpanded(!expanded)
  }, [expanded, setExpanded])

  return (
    <Collapse
      collapsedHeight={'1.5em'}
      in={expanded}
      timeout={'auto'}
      className={clsx(
        classes.commentBlock,
        lines.length > 1 && classes.pointerCursor
      )}
    >
      <Typography variant={'body1'} onClick={handleExpandClick}>
        {formatted}
      </Typography>
    </Collapse>
  )
}

export const useGetHandleGenreClick = (width) => {
  const [perPage] = useAlbumsPerPage(width)

  return (id) => {
    return `/album?filter={"genre_id":"${id}"}&order=ASC&sort=name&perPage=${perPage}`
  }
}

const GenreChipField = withWidth()(({ width, ...rest }) => {
  const record = useRecordContext(rest)
  const genreLink = useGetHandleGenreClick(width)

  return (
    <Link to={genreLink(record.id)} onClick={(e) => e.stopPropagation()}>
      <ChipField
        source="name"
        // Workaround to force ChipField to be clickable
        onClick={() => {}}
      />
    </Link>
  )
})

const GenreList = () => {
  const classes = useStyles()
  return (
    <ArrayField className={classes.genreList} source={'genres'}>
      <SingleFieldList linkType={false}>
        <GenreChipField />
      </SingleFieldList>
    </ArrayField>
  )
}

const Details = (props) => {
  const isXsmall = useMediaQuery((theme) => theme.breakpoints.down('xs'))
  const translate = useTranslate()
  const record = useRecordContext(props)
  let details = []
  const addDetail = (obj) => {
    const id = details.length
    details.push(<span key={`detail-${record.id}-${id}`}>{obj}</span>)
  }

  const year = formatRange(record, 'year')
  year && addDetail(<>{year}</>)
  addDetail(
    <>
      {record.songCount +
        ' ' +
        translate('resources.song.name', {
          smart_count: record.songCount,
        })}
    </>
  )
  !isXsmall && addDetail(<DurationField source={'duration'} />)
  !isXsmall && addDetail(<SizeField source="size" />)

  return <>{intersperse(details, ' · ')}</>
}

const AlbumDetails = (props) => {
  const record = useRecordContext(props)
  const isXsmall = useMediaQuery((theme) => theme.breakpoints.down('xs'))
  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up('lg'))
  const classes = useStyles()
  const [isLightboxOpen, setLightboxOpen] = React.useState(false)

  const imageUrl = subsonic.getCoverArtUrl(record, 300)
  const fullImageUrl = subsonic.getCoverArtUrl(record)

  const handleOpenLightbox = React.useCallback(() => setLightboxOpen(true), [])
  const handleCloseLightbox = React.useCallback(
    () => setLightboxOpen(false),
    []
  )
  return (
    <Card className={classes.root}>
      <div className={classes.cardContents}>
        <div className={classes.coverParent}>
          <CardMedia
            component={'img'}
            src={imageUrl}
            width="400"
            height="400"
            className={classes.cover}
            onClick={handleOpenLightbox}
            title={record.name}
          />
        </div>
        <div className={classes.details}>
          <CardContent className={classes.content}>
            <Typography
              variant={isDesktop ? 'h5' : 'h6'}
              className={classes.recordName}
            >
              {record.name}
              {config.enableFavourites && (
                <LoveButton
                  className={classes.loveButton}
                  record={record}
                  resource={'album'}
                  size={isDesktop ? 'default' : 'small'}
                  aria-label="love"
                  color="primary"
                />
              )}
            </Typography>
            <Typography component={'h6'} className={classes.recordArtist}>
              <ArtistLinkField record={record} />
            </Typography>
            <Typography component={'div'} className={classes.recordMeta}>
              <Details />
            </Typography>
            {config.enableStarRating && (
              <div>
                <RatingField
                  record={record}
                  resource={'album'}
                  size={isDesktop ? 'medium' : 'small'}
                />
              </div>
            )}
            {isDesktop ? (
              <GenreList />
            ) : (
              <Typography component={'p'}>{record.genre}</Typography>
            )}
            {!isXsmall && (
              <Typography component={'div'} className={classes.recordMeta}>
                <AlbumExternalLinks className={classes.externalLinks} />
              </Typography>
            )}
            {isDesktop && record['comment'] && <AlbumComment record={record} />}
          </CardContent>
        </div>
      </div>
      {!isDesktop && record['comment'] && <AlbumComment record={record} />}
      {isLightboxOpen && (
        <Lightbox
          imagePadding={50}
          animationDuration={200}
          imageTitle={record.name}
          mainSrc={fullImageUrl}
          onCloseRequest={handleCloseLightbox}
        />
      )}
    </Card>
  )
}

export default AlbumDetails
