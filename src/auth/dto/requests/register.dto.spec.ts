import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';
import { Gender } from '@/customers/enums';

describe('RegisterDto', () => {
  const validDto: RegisterDto = {
    phone: '0987654321',
    email: 'test@example.com',
    password: 'P@ssword123',
    passwordConfirmation: 'P@ssword123',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '2000-01-01',
    gender: Gender.MALE,
  };

  const validateDto = async (dto: Partial<RegisterDto>) => {
    const instance = Object.assign(new RegisterDto(), dto);
    return validate(instance);
  };

  it('should pass with valid data', async () => {
    const errors = await validateDto(validDto);
    expect(errors.length).toBe(0);
  });

  describe('phone', () => {
    it('should fail if undefined', async () => {
      const errors = await validateDto({ ...validDto, phone: undefined });
      expect(errors.some((e) => e.property === 'phone')).toBeTruthy();
    });

    it('should fail if empty', async () => {
      const errors = await validateDto({ ...validDto, phone: '' });
      expect(errors.some((e) => e.property === 'phone')).toBeTruthy();
    });

    it('should fail if too short', async () => {
      const errors = await validateDto({ ...validDto, phone: '+123456' });
      expect(errors.some((e) => e.property === 'phone')).toBeTruthy();
    });

    it('should pass if max allowed length', async () => {
      const errors = await validateDto({ ...validDto, phone: '1'.repeat(30) });
      expect(errors.length).toBe(0);
    });

    it('should fail if exceeds max length', async () => {
      const errors = await validateDto({ ...validDto, phone: '1'.repeat(31) });
      expect(errors.some((e) => e.property === 'phone')).toBeTruthy();
    });

    it('should fail if not a string', async () => {
      // @ts-expect-error testing invalid type
      const errors = await validateDto({ ...validDto, phone: 1234567890 });
      expect(errors.some((e) => e.property === 'phone')).toBeTruthy();
    });

    it('should fail if contains letters', async () => {
      const errors = await validateDto({ ...validDto, phone: 'abc1234567' });
      expect(errors.some((e) => e.property === 'phone')).toBeTruthy();
    });

    it('should fail if contains invalid symbols', async () => {
      const errors = await validateDto({ ...validDto, phone: '+123#456789' });
      expect(errors.some((e) => e.property === 'phone')).toBeTruthy();
    });

    it('should fail if only "+"', async () => {
      const errors = await validateDto({ ...validDto, phone: '+' });
      expect(errors.some((e) => e.property === 'phone')).toBeTruthy();
    });

    it('should pass if spaces are in the middle', async () => {
      const errors = await validateDto({
        ...validDto,
        phone: '+1 234 567 890',
      });
      expect(errors.length).toBe(0);
    });

    it('should fail if space at start', async () => {
      const errors = await validateDto({ ...validDto, phone: ' 1234567890' });
      expect(errors.some((e) => e.property === 'phone')).toBeTruthy();
    });

    it('should fail if space at end', async () => {
      const errors = await validateDto({ ...validDto, phone: '1234567890 ' });
      expect(errors.some((e) => e.property === 'phone')).toBeTruthy();
    });

    it('should pass if hyphens are in the middle', async () => {
      const errors = await validateDto({
        ...validDto,
        phone: '+1-234-567-890',
      });
      expect(errors.length).toBe(0);
    });
  });

  describe('email', () => {
    it('should pass if undefined', async () => {
      const errors = await validateDto({ ...validDto, email: undefined });
      expect(errors.length).toBe(0);
    });

    it('should fail if empty', async () => {
      const errors = await validateDto({ ...validDto, email: '' });
      expect(errors.some((e) => e.property === 'email')).toBeTruthy();
    });

    it('should pass if at max allowed length', async () => {
      const email = 'a'.repeat(308) + '@example.com';
      const errors = await validateDto({ ...validDto, email });
      expect(errors.length).toBe(0);
    });

    it('should fail if exceeds max length', async () => {
      const errors = await validateDto({
        ...validDto,
        email: `${'1'.repeat(309)}@example.com`,
      });
      expect(errors.some((e) => e.property === 'email')).toBeTruthy();
    });

    it('should fail if invalid format', async () => {
      const errors = await validateDto({ ...validDto, email: 'invalid-email' });
      expect(errors.some((e) => e.property === 'email')).toBeTruthy();
    });

    it('should fail if contains spaces', async () => {
      const errors = await validateDto({
        ...validDto,
        email: 'test @example.com',
      });
      expect(errors.some((e) => e.property === 'email')).toBeTruthy();
    });
  });

  describe('password', () => {
    it('should fail if too short', async () => {
      const errors = await validateDto({ ...validDto, password: 'Pass1' });
      expect(errors.some((e) => e.property === 'password')).toBeTruthy();
    });

    it('should fail if complexity requirements are not met', async () => {
      const errors = await validateDto({ ...validDto, password: 'password' });
      expect(errors.some((e) => e.property === 'password')).toBeTruthy();
    });
  });

  describe('passwordConfirmation', () => {
    it('should fail if does not match password', async () => {
      const errors = await validateDto({
        ...validDto,
        passwordConfirmation: 'Different1',
      });
      expect(
        errors.some((e) => e.property === 'passwordConfirmation'),
      ).toBeTruthy();
    });

    it('should fail if empty', async () => {
      const errors = await validateDto({
        ...validDto,
        passwordConfirmation: '',
      });
      expect(
        errors.some((e) => e.property === 'passwordConfirmation'),
      ).toBeTruthy();
    });
  });

  describe('firstName', () => {
    it('should fail if undefined', async () => {
      const errors = await validateDto({ ...validDto, firstName: undefined });
      expect(errors.some((e) => e.property === 'firstName')).toBeTruthy();
    });

    it('should fail if empty', async () => {
      const errors = await validateDto({ ...validDto, firstName: '' });
      expect(errors.some((e) => e.property === 'firstName')).toBeTruthy();
    });

    it('should fail if exceeds max length', async () => {
      const errors = await validateDto({
        ...validDto,
        firstName: 'a'.repeat(256),
      });
      expect(errors.some((e) => e.property === 'firstName')).toBeTruthy();
    });
  });

  describe('lastName', () => {
    it('should fail if undefined', async () => {
      const errors = await validateDto({ ...validDto, lastName: undefined });
      expect(errors.some((e) => e.property === 'lastName')).toBeTruthy();
    });

    it('should fail if empty', async () => {
      const errors = await validateDto({ ...validDto, lastName: '' });
      expect(errors.some((e) => e.property === 'lastName')).toBeTruthy();
    });

    it('should fail if exceeds max length', async () => {
      const errors = await validateDto({
        ...validDto,
        lastName: 'a'.repeat(256),
      });
      expect(errors.some((e) => e.property === 'lastName')).toBeTruthy();
    });
  });

  describe('dateOfBirth', () => {
    it('should pass if undefined', async () => {
      const errors = await validateDto({ ...validDto, dateOfBirth: undefined });
      expect(errors.length).toBe(0);
    });

    it('should fail if empty', async () => {
      const errors = await validateDto({ ...validDto, dateOfBirth: '' });
      expect(errors.some((e) => e.property === 'dateOfBirth')).toBeTruthy();
    });

    it('should fail if invalid', async () => {
      const errors = await validateDto({
        ...validDto,
        dateOfBirth: 'invalid-date',
      });
      expect(errors.some((e) => e.property === 'dateOfBirth')).toBeTruthy();
    });
  });

  describe('gender', () => {
    it('should pass if undefined', async () => {
      const errors = await validateDto({ ...validDto, gender: undefined });
      expect(errors.length).toBe(0);
    });

    it('should fail if empty', async () => {
      const errors = await validateDto({
        ...validDto,
        gender: '' as unknown as Gender,
      });
      expect(errors.some((e) => e.property === 'gender')).toBeTruthy();
    });

    it('should fail if invalid', async () => {
      const errors = await validateDto({
        ...validDto,
        gender: 'INVALID' as unknown as Gender,
      });
      expect(errors.some((e) => e.property === 'gender')).toBeTruthy();
    });
  });
});
