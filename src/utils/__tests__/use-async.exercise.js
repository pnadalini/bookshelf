import {renderHook, act} from '@testing-library/react'
import {useAsync} from '../hooks'

function deferred() {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return {promise, resolve, reject}
}

beforeEach(() => {
  jest.spyOn(console, 'error')
})

afterEach(() => {
  console.error.mockRestore()
})

function getUseAsyncState(overrides) {
  return {
    data: null,
    isIdle: true,
    isLoading: false,
    isError: false,
    isSuccess: false,

    error: null,
    status: 'idle',
    run: expect.any(Function),
    reset: expect.any(Function),
    setData: expect.any(Function),
    setError: expect.any(Function),
    ...overrides,
  }
}

test('calling run with a promise which resolves', async () => {
  const {promise, resolve} = deferred()

  const {result} = renderHook(() => useAsync())

  expect(result.current).toEqual(getUseAsyncState())
  let testPromise
  act(() => {
    testPromise = result.current.run(promise)
  })
  expect(result.current).toEqual(
    getUseAsyncState({status: 'pending', isIdle: false, isLoading: true}),
  )

  await act(async () => {
    resolve()
    await testPromise
  })
  expect(result.current).toEqual(
    getUseAsyncState({
      status: 'resolved',
      isIdle: false,
      data: undefined,
      isSuccess: true,
    }),
  )

  act(() => {
    result.current.reset()
  })
  expect(result.current).toEqual(getUseAsyncState())
})

test('calling run with a promise which rejects', async () => {
  const {promise, reject} = deferred()

  const {result} = renderHook(() => useAsync())

  let testPromise
  act(() => {
    testPromise = result.current.run(promise).catch(() => {})
  })
  expect(result.current).toEqual(
    getUseAsyncState({status: 'pending', isIdle: false, isLoading: true}),
  )

  const rejectedReason = 'reject reason'
  await act(async () => {
    reject(rejectedReason)
    await testPromise
  })
  expect(result.current.status).toEqual('rejected')
  expect(result.current.error).toEqual(rejectedReason)
  expect(result.current).toEqual(
    getUseAsyncState({
      status: 'rejected',
      error: rejectedReason,
      isError: true,
      isIdle: false,
    }),
  )
})

test('can specify an initial state', () => {
  const mockData = {response: 'new info'}
  const customInitialState = {status: 'resolved', data: mockData}
  const {result} = renderHook(() => useAsync(customInitialState))
  expect(result.current).toEqual(
    getUseAsyncState({
      status: 'resolved',
      data: mockData,
      isIdle: false,
      isSuccess: true,
    }),
  )
})

test('can set the data', () => {
  const mockData = {response: 'new info'}
  const {result} = renderHook(() => useAsync())
  act(() => {
    result.current.setData(mockData)
  })
  expect(result.current).toEqual(
    getUseAsyncState({
      status: 'resolved',
      data: mockData,
      isIdle: false,
      isSuccess: true,
    }),
  )
})

test('can set the error', () => {
  const mockData = {message: 'error message'}
  const {result} = renderHook(() => useAsync())
  act(() => {
    result.current.setError(mockData)
  })
  expect(result.current).toEqual(
    getUseAsyncState({
      status: 'rejected',
      error: mockData,
      isIdle: false,
      isError: true,
    }),
  )
})

test('No state updates happen if the component is unmounted while pending', async () => {
  const {promise, resolve} = deferred()
  const {result, unmount} = renderHook(() => useAsync())
  let p
  act(() => {
    p = result.current.run(promise)
  })
  unmount()
  await act(async () => {
    resolve()
    await p
  })
  expect(console.error).not.toHaveBeenCalled()
})

test('calling "run" without a promise results in an early error', () => {
  const {result} = renderHook(() => useAsync())
  expect(() => result.current.run()).toThrowErrorMatchingInlineSnapshot(
    `"The argument passed to useAsync().run must be a promise. Maybe a function that's passed isn't returning anything?"`,
  )
})
