import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TestButton from '../TestButton';

describe('TestButton', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <TestButton title="Click me" onPress={() => {}} />
    );

    expect(getByText('Click me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockFn = jest.fn();

    const { getByText } = render(
      <TestButton title="Click me" onPress={mockFn} />
    );

    fireEvent.press(getByText('Click me'));

    expect(mockFn).toHaveBeenCalled();
  });
});