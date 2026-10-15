import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginModal } from './LoginModal';
import { AuthProvider } from '../hooks/useAuth';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    verify: vi.fn(),
  },
  parseApiError: (err: unknown) => ({ message: err instanceof Error ? err.message : 'Invalid login code' }),
}));

describe('LoginModal Component', () => {
  const defaultProps = {
    isOpen: true,
    email: 'user@example.com',
    onClose: vi.fn(),
    onContinueAsGuest: vi.fn(),
    onSuccess: vi.fn(),
  };

  it('renders modal with email and 6 digit inputs', () => {
    render(
      <AuthProvider>
        <LoginModal {...defaultProps} />
      </AuthProvider>
    );

    expect(screen.getByText('Welcome back!')).toBeInTheDocument();
    expect(screen.getByText(/user@example\.com/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue as guest/i })).toBeInTheDocument();

    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);
  });

  it('triggers onContinueAsGuest when clicking continue as guest', () => {
    render(
      <AuthProvider>
        <LoginModal {...defaultProps} />
      </AuthProvider>
    );

    const guestBtn = screen.getByRole('button', { name: /Continue as guest/i });
    fireEvent.click(guestBtn);

    expect(defaultProps.onContinueAsGuest).toHaveBeenCalledTimes(1);
  });

  it('submits code and logs in user when 6 digits are entered', async () => {
    vi.mocked(api.verify).mockResolvedValueOnce({
      authenticated: true,
      token: 'jwt.token.here',
      user: { id: 1, email: 'user@example.com', firstName: 'John', lastName: 'Doe' },
    });

    render(
      <AuthProvider>
        <LoginModal {...defaultProps} />
      </AuthProvider>
    );

    const inputs = screen.getAllByRole('textbox');
    ['4', '8', '2', '7', '3', '1'].forEach((digit, i) => {
      fireEvent.change(inputs[i], { target: { value: digit } });
    });

    const loginBtn = screen.getByRole('button', { name: /Login/i });
    fireEvent.click(loginBtn);

    await waitFor(() => {
      expect(api.verify).toHaveBeenCalledWith({
        email: 'user@example.com',
        code: '482731',
      });
      expect(defaultProps.onSuccess).toHaveBeenCalled();
    });
  });
});
