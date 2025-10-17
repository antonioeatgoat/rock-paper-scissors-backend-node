import { User } from './user';
import { UserStatus } from './user-status.enum';

describe('User', () => {
  it('should be defined', () => {
    expect(new User('1', 'test')).toBeDefined();
  });

  it('should return correct id', () => {
    const test = new User('1', 'test');
    expect(test.getId()).toBe(1);
  });

  it('should return correct nickname', () => {
    const test = new User('1', 'test');
    expect(test.getNickname()).toBe('test');
  });

  it('should return correct status', () => {
    const test = new User('1', 'test');
    expect(test.getStatus()).toBe(UserStatus.IDLE);
  });

  it('should update the status', () => {
    const test = new User('123456', 'test');
    test.setStatus(UserStatus.PLAYING);
    expect(test.getStatus()).toBe(UserStatus.PLAYING);
  });
});
