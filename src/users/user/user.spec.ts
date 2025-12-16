import { User } from './user';

describe('User', () => {
  it('should be defined', () => {
    expect(new User('test')).toBeDefined();
  });

  it('should return correct nickname', () => {
    const test = new User('test');
    expect(test.nickname()).toBe('test');
  });
});
