import { render, screen } from '@testing-library/react';
import BingoApp from './BingoApp';

test('renders learn react link', () => {
  render(<BingoApp />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
