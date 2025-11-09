import { User } from './user';
import { UserStatus } from './user-status.enum';

describe('User', () => {
  it('should be defined', () => {
    expect(new User('test')).toBeDefined();
  });

  it('should return correct nickname', () => {
    const test = new User('test');
    expect(test.nickname()).toBe('test');
  });

  it('should return correct status', () => {
    const test = new User('test');
    expect(test.status()).toBe(UserStatus.IDLE);
  });

  it('should update the status', () => {
    const test = new User('test');
    test.setStatus(UserStatus.PLAYING);
    expect(test.status()).toBe(UserStatus.PLAYING);
  });
});
