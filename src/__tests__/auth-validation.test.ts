describe('Auth Form Validations', () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateLoginForm = (email: string, pass: string) => {
    if (!email.trim()) return { valid: false, error: 'Por favor ingresa tu correo electrónico.' };
    if (!emailRegex.test(email.trim())) return { valid: false, error: 'Ingresa un correo electrónico válido.' };
    if (!pass) return { valid: false, error: 'Por favor ingresa tu contraseña.' };
    return { valid: true, error: null };
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: 'Débil' };
    if (score <= 4) return { score: 2, label: 'Media' };
    return { score: 3, label: 'Fuerte' };
  };

  const validateRegisterForm = (email: string, pass: string, confirm: string) => {
    if (!email.trim()) return { valid: false, error: 'Por favor ingresa tu correo electrónico.' };
    if (!emailRegex.test(email.trim())) return { valid: false, error: 'Ingresa un correo electrónico válido.' };
    if (!pass) return { valid: false, error: 'Por favor ingresa una contraseña.' };
    if (pass.length < 6) return { valid: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
    if (pass !== confirm) return { valid: false, error: 'Las contraseñas no coinciden.' };
    return { valid: true, error: null };
  };

  test('debe rechazar correos vacíos o mal formados en login', () => {
    expect(validateLoginForm('', 'password123').valid).toBe(false);
    expect(validateLoginForm('correo-invalido', 'password123').valid).toBe(false);
    expect(validateLoginForm('user@domain.com', '').valid).toBe(false);
    expect(validateLoginForm('user@domain.com', '123456').valid).toBe(true);
  });

  test('debe calcular la fortaleza de contraseña correctamente', () => {
    expect(getPasswordStrength('12345').label).toBe('Débil');
    expect(getPasswordStrength('Pass123').label).toBe('Media');
    expect(getPasswordStrength('NextDate2026!#Strong').label).toBe('Fuerte');
  });

  test('debe validar registro y coincidencia de contraseñas', () => {
    expect(validateRegisterForm('user@domain.com', '123456', 'diferente').valid).toBe(false);
    expect(validateRegisterForm('user@domain.com', '12345', '12345').valid).toBe(false);
    expect(validateRegisterForm('user@domain.com', 'Password123!', 'Password123!').valid).toBe(true);
  });
});
