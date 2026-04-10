import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from '../../screens/HomeScreen';

jest.mock('../../context/SampleContext', () => ({
  useSampleContext: () => ({
    currentSample: '420',
    isLoading: false,
    error: null,
  }),
}));

describe('HomeScreen', () => {
  it('renders placeholder text', () => {
    const { getByText } = render(
      <HomeScreen
        navigation={{ navigate: jest.fn() } as any}
        route={{ key: 'Home-1', name: 'Home' } as any}
      />,
    );

    expect(getByText('Sensory Evaluation')).toBeTruthy();
  });
});
