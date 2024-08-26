import {useQuery, queryCache, useMutation} from 'react-query'
import {client} from 'utils/api-client'
import {setQueryDataForBook} from './books'

function useListItems(user) {
  const result = useQuery({
    queryKey: 'list-items',
    queryFn: () =>
      client(`list-items`, {token: user.token}).then(data => data.listItems),
    config: {
      onSuccess(listItems) {
        for (const listItem of listItems) {
          setQueryDataForBook(listItem.book)
        }
      },
    },
  })
  return {...result, listItems: result.data}
}

function useListItem(user, bookId) {
  const {listItems} = useListItems(user)
  return listItems?.find(li => li.bookId === bookId) ?? null
}

const defaultMutationOptions = {
  onError: (err, variables, recover) =>
    typeof recover === 'function' ? recover() : null,
  onSettled: () => queryCache.invalidateQueries('list-items'),
}

function useUpdateListItem(user, mutationOptions = {}) {
  return useMutation(
    ({id, ...data}) =>
      client(`list-items/${id}`, {
        data,
        method: 'PUT',
        token: user.token,
      }),
    {
      onMutate(newItem) {
        const prevItems = queryCache.getQueryData('list-items')

        queryCache.setQueryData('list-items', old => {
          return old.map(item => {
            return item.id === newItem.id ? {...item, ...newItem} : item
          })
        })

        return () => queryCache.setQueryData('list-items', prevItems)
      },
      ...defaultMutationOptions,
      ...mutationOptions,
    },
  )
}

function useRemoveListItem(user, mutationOptions = {}) {
  return useMutation(
    ({id}) =>
      client(`list-items/${id}`, {
        method: 'DELETE',
        token: user.token,
      }),
    {
      onMutate(prevItem) {
        const prevItems = queryCache.getQueryData('list-items')

        queryCache.setQueryData('list-items', old => {
          return old.map(item => {
            return item.id === prevItem.id ? {...item, ...prevItem} : item
          })
        })

        return () => queryCache.setQueryData('list-items', prevItems)
      },
      ...defaultMutationOptions,
      ...mutationOptions,
    },
  )
}

function useCreateListItem(user, mutationOptions = {}) {
  return useMutation(
    data =>
      client('list-items', {
        data,
        token: user.token,
      }),
    {...defaultMutationOptions, ...mutationOptions},
  )
}

export {
  useListItems,
  useListItem,
  useCreateListItem,
  useUpdateListItem,
  useRemoveListItem,
}
