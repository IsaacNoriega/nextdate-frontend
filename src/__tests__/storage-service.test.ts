import { storageService } from '../services/storage';

describe('StorageService', () => {
  beforeEach(async () => {
    await storageService.clearAll();
  });

  test('debe guardar y recuperar un token JWT correctamente', async () => {
    await storageService.setToken('mock_jwt_token_xyz_123');
    const retrieved = await storageService.getToken();
    expect(retrieved).toBe('mock_jwt_token_xyz_123');
  });

  test('debe guardar y recuperar objetos de usuario serializados', async () => {
    const mockUser = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'pareja@nextdate.com',
      createdAt: '2026-09-01T00:00:00Z',
    };

    await storageService.setUser(mockUser);
    const user = await storageService.getUser<{ id: string; email: string }>();
    expect(user).toBeTruthy();
    expect(user?.email).toBe('pareja@nextdate.com');
    expect(user?.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  test('debe limpiar tokens y usuarios al hacer logout', async () => {
    await storageService.setToken('mock_token');
    await storageService.setUser({ id: 'u1', email: 'test@nextdate.com' });

    await storageService.removeToken();
    await storageService.removeUser();

    expect(await storageService.getToken()).toBeNull();
    expect(await storageService.getUser()).toBeNull();
  });
});
