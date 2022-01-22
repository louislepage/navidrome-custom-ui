import React, { useState } from 'react'
import { Typography, Collapse } from '@material-ui/core'
import { makeStyles } from '@material-ui/core'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import ArtistExternalLinks from './ArtistExternalLink'
import config from '../config'
import { LoveButton, RatingField } from '../common'
import Lightbox from 'react-image-lightbox'

const useStyles = makeStyles(
  (theme) => ({
    root: {
      display: 'flex',
      padding: '1em',
    },
    details: {
      display: 'flex',
      flex: '1',
      flexDirection: 'column',
    },
    biography: {
      display: 'inline-block',
      marginTop: '1em',
      float: 'left',
      wordBreak: 'break-word',
      cursor: 'pointer',
    },
    content: {
      flex: '1 0 auto',
    },
    cover: {
      width: 151,
      borderRadius: '6em',
      cursor: 'pointer',
    },
    artistImage: {
      maxHeight: '9.5rem',
      backgroundColor: 'inherit',
      display: 'flex',
      boxShadow: 'none',
    },
    artistDetail: {
      flex: '1',
      padding: '3%',
      display: 'flex',
      minHeight: '10rem',
    },
    button: {
      marginLeft: '0.9em',
    },
    loveButton: {
      top: theme.spacing(-0.2),
      left: theme.spacing(0.5),
    },
    rating: {
      marginTop: '5px',
    },
    artistName: {
      wordBreak: 'break-word',
    },
  }),
  { name: 'NDDesktopArtistDetails' }
)

const DesktopArtistDetails = ({ img, artistInfo, record, biography }) => {
  const [expanded, setExpanded] = useState(false)
  const classes = useStyles({ img, expanded })
  const title = record.name
  const [isLightboxOpen, setLightboxOpen] = React.useState(false)

  const handleOpenLightbox = React.useCallback(() => setLightboxOpen(true), [])
  const handleCloseLightbox = React.useCallback(
    () => setLightboxOpen(false),
    []
  )

  return (
    <div className={classes.root}>
      <Card className={classes.artistDetail}>
        <Card className={classes.artistImage}>
          {artistInfo && (
            <CardMedia
              className={classes.cover}
              image={artistInfo.mediumImageUrl}
              onClick={handleOpenLightbox}
              title={title}
            />
          )}
        </Card>
        <div className={classes.details}>
          <CardContent className={classes.content}>
            <Typography
              component="h5"
              variant="h5"
              className={classes.artistName}
            >
              {title}
              {config.enableFavourites && (
                <LoveButton
                  className={classes.loveButton}
                  record={record}
                  resource={'artist'}
                  size={'default'}
                  aria-label="love"
                  color="primary"
                />
              )}
            </Typography>
            {config.enableStarRating && (
              <div>
                <RatingField
                  record={record}
                  resource={'artist'}
                  size={'small'}
                  className={classes.rating}
                />
              </div>
            )}
            <Collapse
              collapsedHeight={'4.5em'}
              in={expanded}
              timeout={'auto'}
              className={classes.biography}
            >
              <Typography
                variant={'body1'}
                onClick={() => setExpanded(!expanded)}
              >
                <span dangerouslySetInnerHTML={{ __html: biography }} />
              </Typography>
            </Collapse>
          </CardContent>
          <Typography component={'div'} className={classes.button}>
            <ArtistExternalLinks artistInfo={artistInfo} record={record} />
          </Typography>
        </div>
        {isLightboxOpen && (
          <Lightbox
            imagePadding={50}
            animationDuration={200}
            imageTitle={record.name}
            mainSrc={artistInfo.largeImageUrl}
            onCloseRequest={handleCloseLightbox}
          />
        )}
      </Card>
    </div>
  )
}

export default DesktopArtistDetails
