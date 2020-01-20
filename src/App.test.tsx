import { render } from '@testing-library/react';
import React from 'react';
import AppBody from './App';

test('renders learn react link', () => {
  const { getByText } = render(<AppBody />);
  const linkElement = getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
