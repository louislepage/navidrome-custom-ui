import * as React from 'react'
import { TestContext } from 'ra-test'
import { DataProviderContext } from 'react-admin'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { AddToPlaylistDialog } from './AddToPlaylistDialog'

const mockData = [
  { id: 'sample-id1', name: 'sample playlist 1', ownerId: 'admin' },
  { id: 'sample-id2', name: 'sample playlist 2', ownerId: 'admin' },
]
const mockIndexedData = {
  'sample-id1': {
    id: 'sample-id1',
    name: 'sample playlist 1',
    ownerId: 'admin',
  },
  'sample-id2': {
    id: 'sample-id2',
    name: 'sample playlist 2',
    ownerId: 'admin',
  },
}
const selectedIds = ['song-1', 'song-2']

const createTestUtils = (mockDataProvider) =>
  render(
    <DataProviderContext.Provider value={mockDataProvider}>
      <TestContext
        initialState={{
          addToPlaylistDialog: {
            open: true,
            duplicateSong: false,
            selectedIds: selectedIds,
          },
          admin: {
            ui: { optimistic: false },
            resources: {
              playlist: {
                data: mockIndexedData,
                list: {
                  cachedRequests: {
                    '{"pagination":{"page":1,"perPage":-1},"sort":{"field":"name","order":"ASC"},"filter":{}}':
                      {
                        ids: ['sample-id1', 'sample-id2'],
                        total: 2,
                      },
                  },
                },
              },
            },
          },
        }}
      >
        <AddToPlaylistDialog />
      </TestContext>
    </DataProviderContext.Provider>
  )

describe('AddToPlaylistDialog', () => {
  beforeAll(() => localStorage.setItem('userId', 'admin'))
  afterEach(cleanup)

  it('adds distinct songs to already existing playlists', async () => {
    const mockDataProvider = {
      getList: jest
        .fn()
        .mockResolvedValue({ data: mockData, total: mockData.length }),
      getOne: jest.fn().mockResolvedValue({ data: { id: 'song-3' }, total: 1 }),
      create: jest.fn().mockResolvedValue({
        data: { id: 'created-id', name: 'created-name' },
      }),
    }

    const testUtils = createTestUtils(mockDataProvider)

    fireEvent.change(document.activeElement, { target: { value: 'sample' } })
    fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' })
    fireEvent.keyDown(document.activeElement, { key: 'Enter' })
    fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' })
    fireEvent.keyDown(document.activeElement, { key: 'Enter' })
    await waitFor(() => {
      expect(testUtils.getByTestId('playlist-add')).not.toBeDisabled()
    })
    fireEvent.click(testUtils.getByTestId('playlist-add'))
    await waitFor(() => {
      expect(mockDataProvider.create).toHaveBeenNthCalledWith(
        1,
        'playlistTrack',
        {
          data: { ids: selectedIds },
          filter: { playlist_id: 'sample-id1' },
        }
      )
    })
    await waitFor(() => {
      expect(mockDataProvider.create).toHaveBeenNthCalledWith(
        2,
        'playlistTrack',
        {
          data: { ids: selectedIds },
          filter: { playlist_id: 'sample-id2' },
        }
      )
    })
  })

  it('adds distinct songs to a new playlist', async () => {
    const mockDataProvider = {
      getList: jest
        .fn()
        .mockResolvedValue({ data: mockData, total: mockData.length }),
      getOne: jest.fn().mockResolvedValue({ data: { id: 'song-3' }, total: 1 }),
      create: jest.fn().mockResolvedValue({
        data: { id: 'created-id1', name: 'created-name' },
      }),
    }

    const testUtils = createTestUtils(mockDataProvider)

    fireEvent.change(document.activeElement, { target: { value: 'sample' } })
    fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' })
    fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' })
    fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' })
    fireEvent.keyDown(document.activeElement, { key: 'Enter' })
    await waitFor(() => {
      expect(testUtils.getByTestId('playlist-add')).not.toBeDisabled()
    })
    fireEvent.click(testUtils.getByTestId('playlist-add'))
    await waitFor(() => {
      expect(mockDataProvider.create).toHaveBeenNthCalledWith(1, 'playlist', {
        data: { name: 'sample' },
      })
      expect(mockDataProvider.create).toHaveBeenNthCalledWith(
        2,
        'playlistTrack',
        {
          data: { ids: selectedIds },
          filter: { playlist_id: 'created-id1' },
        }
      )
    })
  })

  it('adds distinct songs to multiple new playlists', async () => {
    const mockDataProvider = {
      getList: jest
        .fn()
        .mockResolvedValue({ data: mockData, total: mockData.length }),
      getOne: jest.fn().mockResolvedValue({ data: { id: 'song-3' }, total: 1 }),
      create: jest.fn().mockResolvedValue({
        data: { id: 'created-id1', name: 'created-name' },
      }),
    }

    const testUtils = createTestUtils(mockDataProvider)

    fireEvent.change(document.activeElement, { target: { value: 'sample' } })
    fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' })
    fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' })
    fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' })
    fireEvent.keyDown(document.activeElement, { key: 'Enter' })
    fireEvent.change(document.activeElement, {
      target: { value: 'new playlist' },
    })
    fireEvent.keyDown(document.activeElement, { key: 'Enter' })
    await waitFor(() => {
      expect(testUtils.getByTestId('playlist-add')).not.toBeDisabled()
    })
    fireEvent.click(testUtils.getByTestId('playlist-add'))
    await waitFor(() => {
      expect(mockDataProvider.create).toHaveBeenCalledTimes(4)
    })
  })
})
