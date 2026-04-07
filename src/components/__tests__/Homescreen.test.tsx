import React from 'react';
import { render } from '@testing-library/react-native';
import { HomeScreen } from '../../screens/HomeScreen';

describe('HomeScreen', () => {
  it('renders placeholder text', () => {
    const { getByText } = render(<HomeScreen />);

    expect(getByText('Home Screen')).toBeTruthy();
  });
});