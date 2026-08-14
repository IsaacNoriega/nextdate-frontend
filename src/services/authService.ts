import { fetchGraphQL } from './api';

export interface User {
  id: string;
  email: string;
  active: boolean;
}

export interface LoginResult {
  user: User;
  token: string;
}

// 1. Registro de Usuario
const REGISTER_USER_MUTATION = `
  mutation RegisterUser($input: RegisterUserInput!) {
    registerUser(input: $input) {
      id
      email
      active
    }
  }
`;

export async function registerUserApi(email: string, password: string): Promise<User> {
  const data = await fetchGraphQL<{ registerUser: User }>(REGISTER_USER_MUTATION, {
    input: { email, password },
  });
  return data.registerUser;
}

// 2. Inicio de Sesión
const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        email
        active
      }
      token
    }
  }
`;

export async function loginApi(email: string, password: string): Promise<LoginResult> {
  const data = await fetchGraphQL<{ login: LoginResult }>(LOGIN_MUTATION, {
    input: { email, password },
  });
  return data.login;
}

// 3. Solicitud de Recuperación de Contraseña
const REQUEST_PASSWORD_RESET_MUTATION = `
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`;

export async function requestPasswordResetApi(email: string): Promise<boolean> {
  const data = await fetchGraphQL<{ requestPasswordReset: boolean }>(REQUEST_PASSWORD_RESET_MUTATION, {
    email,
  });
  return data.requestPasswordReset;
}

// 4. Restablecimiento de Contraseña
const RESET_PASSWORD_MUTATION = `
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input)
  }
`;

export async function resetPasswordApi(token: string, newPassword: string): Promise<boolean> {
  const data = await fetchGraphQL<{ resetPassword: boolean }>(RESET_PASSWORD_MUTATION, {
    input: { token, newPassword },
  });
  return data.resetPassword;
}
