import React, { isValidElement, useMemo, useCallback, forwardRef } from 'react'
import { useDispatch } from 'react-redux'
import { Datagrid, PureDatagridBody, PureDatagridRow } from 'react-admin'
import {
  TableCell,
  TableRow,
  Typography,
  useMediaQuery,
} from '@material-ui/core'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import AlbumIcon from '@material-ui/icons/Album'
import clsx from 'clsx'
import { useDrag } from 'react-dnd'
import { playTracks } from '../actions'
import { AlbumContextMenu } from '../common'
import { DraggableTypes } from '../consts'

const useStyles = makeStyles({
  subtitle: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    verticalAlign: 'middle',
  },
  discIcon: {
    verticalAlign: 'text-top',
    marginRight: '4px',
  },
  row: {
    cursor: 'pointer',
    '&:hover': {
      '& $contextMenu': {
        visibility: 'visible',
      },
    },
  },
  headerStyle: {
    '& thead': {
      boxShadow: '0px 3px 3px rgba(0, 0, 0, 0.15)',
    },
    '& th': {
      fontWeight: 'bold',
      padding: '15px',
    },
  },
  contextMenu: {
    visibility: (props) => (props.isDesktop ? 'hidden' : 'visible'),
  },
})

const DiscSubtitleRow = forwardRef(
  ({ record, onClick, colSpan, contextAlwaysVisible }, ref) => {
    const isDesktop = useMediaQuery((theme) => theme.breakpoints.up('md'))
    const classes = useStyles({ isDesktop })
    const handlePlayDisc = (discNumber) => () => {
      onClick(discNumber)
    }

    let subtitle = []
    if (record.discNumber > 0) {
      subtitle.push(record.discNumber)
    }
    if (record.discSubtitle) {
      subtitle.push(record.discSubtitle)
    }

    return (
      <TableRow
        hover
        ref={ref}
        onClick={handlePlayDisc(record.discNumber)}
        className={classes.row}
      >
        <TableCell colSpan={colSpan}>
          <Typography variant="h6" className={classes.subtitle}>
            <AlbumIcon className={classes.discIcon} fontSize={'small'} />
            {subtitle.join(': ')}
          </Typography>
        </TableCell>
        <TableCell>
          <AlbumContextMenu
            record={{ id: record.albumId }}
            discNumber={record.discNumber}
            showLove={false}
            className={classes.contextMenu}
            visible={contextAlwaysVisible}
          />
        </TableCell>
      </TableRow>
    )
  }
)

export const SongDatagridRow = ({
  record,
  children,
  firstTracks,
  contextAlwaysVisible,
  onClickDiscSubtitle,
  className,
  ...rest
}) => {
  const classes = useStyles()
  const fields = React.Children.toArray(children).filter((c) =>
    isValidElement(c)
  )

  const [, dragDiscRef] = useDrag(
    () => ({
      type: DraggableTypes.DISC,
      item: {
        discs: [{ albumId: record?.albumId, discNumber: record?.discNumber }],
      },
      options: { dropEffect: 'copy' },
    }),
    [record]
  )

  const [, dragSongRef] = useDrag(
    () => ({
      type: DraggableTypes.SONG,
      item: { ids: [record?.mediaFileId || record?.id] },
      options: { dropEffect: 'copy' },
    }),
    [record]
  )

  if (!record || !record.title) {
    return null
  }

  const childCount = fields.length
  return (
    <>
      {firstTracks.has(record.id) && (
        <DiscSubtitleRow
          ref={dragDiscRef}
          record={record}
          onClick={onClickDiscSubtitle}
          contextAlwaysVisible={contextAlwaysVisible}
          colSpan={childCount + (rest.expand ? 1 : 0)}
        />
      )}
      <PureDatagridRow
        ref={dragSongRef}
        record={record}
        {...rest}
        className={clsx(className, classes.row)}
      >
        {fields}
      </PureDatagridRow>
    </>
  )
}

SongDatagridRow.propTypes = {
  record: PropTypes.object,
  children: PropTypes.node,
  firstTracks: PropTypes.instanceOf(Set),
  contextAlwaysVisible: PropTypes.bool,
  onClickDiscSubtitle: PropTypes.func,
}

SongDatagridRow.defaultProps = {
  onClickDiscSubtitle: () => {},
}

const SongDatagridBody = ({
  contextAlwaysVisible,
  showDiscSubtitles,
  ...rest
}) => {
  const dispatch = useDispatch()
  const { ids, data } = rest

  const playDisc = useCallback(
    (discNumber) => {
      const idsToPlay = ids.filter((id) => data[id].discNumber === discNumber)
      dispatch(playTracks(data, idsToPlay))
    },
    [dispatch, data, ids]
  )

  const firstTracks = useMemo(() => {
    if (!ids) {
      return new Set()
    }
    let foundSubtitle = false
    const set = new Set(
      ids
        .filter((i) => data[i])
        .reduce((acc, id) => {
          const last = acc && acc[acc.length - 1]
          foundSubtitle = foundSubtitle || data[id].discSubtitle
          if (
            acc.length === 0 ||
            (last && data[id].discNumber !== data[last].discNumber)
          ) {
            acc.push(id)
          }
          return acc
        }, [])
    )
    if (!showDiscSubtitles || (set.size < 2 && !foundSubtitle)) {
      set.clear()
    }
    return set
  }, [ids, data, showDiscSubtitles])

  return (
    <PureDatagridBody
      {...rest}
      row={
        <SongDatagridRow
          firstTracks={firstTracks}
          contextAlwaysVisible={contextAlwaysVisible}
          onClickDiscSubtitle={playDisc}
        />
      }
    />
  )
}

export const SongDatagrid = ({
  contextAlwaysVisible,
  showDiscSubtitles,
  ...rest
}) => {
  const classes = useStyles()
  return (
    <Datagrid
      className={classes.headerStyle}
      {...rest}
      body={
        <SongDatagridBody
          contextAlwaysVisible={contextAlwaysVisible}
          showDiscSubtitles={showDiscSubtitles}
        />
      }
    />
  )
}

SongDatagrid.propTypes = {
  contextAlwaysVisible: PropTypes.bool,
  showDiscSubtitles: PropTypes.bool,
  classes: PropTypes.object,
}
