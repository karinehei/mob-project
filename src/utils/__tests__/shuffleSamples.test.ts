import { shuffleSamples } from '../shuffleSamples';

describe('shuffleSamples', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns a shuffled copy with same sample items', () => {
    const randomSpy = jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0.8)
      .mockReturnValueOnce(0.1);

    const input = ['451', '926', '780', '111'];
    const result = shuffleSamples(input);

    expect(randomSpy).toHaveBeenCalled();
    expect(result).not.toBe(input);
    expect(result).toEqual(['926', '111', '780', '451']);
    expect([...result].sort()).toEqual([...input].sort());
  });
});
