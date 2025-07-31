// src/auth/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    console.log('--- RolesGuard: canActivate method called ---');
    // Get the required roles from the route handler using our decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log('Required roles for this route:', requiredRoles);

    if (!requiredRoles) {
      console.log('No roles specified for this route. Access granted.');
      return true; // No roles specified, access granted
    }

    // Get the user from the request. The JwtStrategy attaches user and roles to the request.
    const { user } = context.switchToHttp().getRequest();

    console.log('User object received in RolesGuard:', user);
    console.log('User roles from user object:', user?.roles);

    // Check if the user exists and has at least one of the required roles
    const hasRole = user && user.roles && requiredRoles.some((role) => user.roles.includes(role));
    console.log('Does user have required role(s)?', hasRole);

    if (!hasRole) {
      console.log('Access denied: User does not have the required role(s).');
    }

    return hasRole;
  }
}