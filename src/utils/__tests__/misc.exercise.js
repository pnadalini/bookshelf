import {formatDate} from 'utils/misc'

test('Testing the formatDate', () => {
  const testDate = new Date('August 06, 2023')
  expect(formatDate(testDate)).toBe('Aug 23')
})
