import { useState } from 'react';

/**
 * Example hook shape. Replace with real hooks (e.g. study state) later.
 */
export function usePlaceholder(): { label: string } {
  const [label] = useState('placeholder');
  // TODO: real state / side effects
  return { label };
}
