import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from '../../screens/HomeScreen';

describe('HomeScreen', () => {
  it('renders placeholder text', () => {
    const { getByText } = render(
      <HomeScreen
        navigation={{ navigate: jest.fn() } as any}
        route={{ key: 'Home-1', name: 'Home' } as any}
      />
    );

    expect(getByText('Home Screen')).toBeTruthy();
  });
});
