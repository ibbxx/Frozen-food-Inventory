export function hasRequiredRole(role, requiredRoles = []) {
  if (!requiredRoles.length) {
    return true;
  }

  return requiredRoles.includes(role);
}
