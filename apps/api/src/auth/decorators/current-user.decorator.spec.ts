import { CurrentUser } from './current-user.decorator';

describe('CurrentUser Decorator', () => {
  it('should be defined', () => {
    expect(CurrentUser).toBeDefined();
  });

  it('should be a function', () => {
    expect(typeof CurrentUser).toBe('function');
  });

  it('should return a parameter decorator function', () => {
    const decorator = CurrentUser();
    expect(typeof decorator).toBe('function');
  });

  it('should work with different parameters', () => {
    const decorator1 = CurrentUser();
    const decorator2 = CurrentUser('someData');
    
    expect(typeof decorator1).toBe('function');
    expect(typeof decorator2).toBe('function');
  });
});
