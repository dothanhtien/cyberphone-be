export function maskIdentifier(identifier: string): string {
  if (!identifier) return '';

  if (identifier.includes('@')) {
    const [name, domain] = identifier.split('@');
    if (name.length <= 1) return `*@${domain}`;
    return `${name[0]}***@${domain}`;
  }

  if (identifier.length <= 4) return '****';

  return `${identifier.slice(0, 2)}****${identifier.slice(-2)}`;
}
