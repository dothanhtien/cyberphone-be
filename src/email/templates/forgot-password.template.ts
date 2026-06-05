export interface ForgotPasswordVars {
  temporaryPassword: string;
}

export function forgotPasswordTemplate(vars: ForgotPasswordVars) {
  return {
    subject: 'Your temporary password',
    text: [
      'You requested a password reset.',
      '',
      `Your temporary password is: ${vars.temporaryPassword}`,
      '',
      'Please log in and change your password immediately.',
    ].join('\n'),
  };
}
