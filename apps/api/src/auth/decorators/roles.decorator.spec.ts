import { Reflector } from '@nestjs/core';
import { Roles } from './roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

describe('Roles Decorator', () => {
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
  });

  it('should be defined', () => {
    expect(Roles).toBeDefined();
  });

  it('should set single role metadata', () => {
    class TestController {
      @Roles(UserRole.ADMIN)
      testMethod() {}
    }

    const roles = reflector.get<UserRole[]>('roles', TestController.prototype.testMethod);
    expect(roles).toEqual([UserRole.ADMIN]);
  });

  it('should set multiple roles metadata', () => {
    class TestController {
      @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
      testMethod() {}
    }

    const roles = reflector.get<UserRole[]>('roles', TestController.prototype.testMethod);
    expect(roles).toEqual([UserRole.ADMIN, UserRole.INSTRUCTOR]);
  });

  it('should work with all role types', () => {
    class TestController {
      @Roles(UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN)
      testMethod() {}
    }

    const roles = reflector.get<UserRole[]>('roles', TestController.prototype.testMethod);
    expect(roles).toEqual([UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN]);
  });

  it('should work with empty roles', () => {
    class TestController {
      @Roles()
      testMethod() {}
    }

    const roles = reflector.get<UserRole[]>('roles', TestController.prototype.testMethod);
    expect(roles).toEqual([]);
  });

  it('should work on class level', () => {
    @Roles(UserRole.ADMIN)
    class TestController {}

    const roles = reflector.get<UserRole[]>('roles', TestController);
    expect(roles).toEqual([UserRole.ADMIN]);
  });
});
