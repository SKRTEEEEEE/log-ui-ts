import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import * as AuthController from '@log-ui/core/presentation/controllers/auth';
import * as AuthUC from '@log-ui/core/application/usecases/services/auth';
import * as UserUC from '@log-ui/core/application/usecases/entities/user';

vi.mock('@log-ui/core/application/usecases/services/auth');
vi.mock('@log-ui/core/application/usecases/entities/user');

describe('Auth Controller', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should call isLoggedInUC', async () => {
        (AuthUC.isLoggedInUC as Mock).mockResolvedValue(true);
        const result = await AuthController.isLoggedIn();
        expect(AuthUC.isLoggedInUC).toHaveBeenCalled();
        expect(result).toBe(true);
    });

    it('should call generatePayloadUC', async () => {
        const payload = { address: '0x123', chainId: 1 } as unknown as Parameters<typeof AuthController.generatePayload>[0];
        const response = { payload: 'xyz' };
        (AuthUC.generatePayloadUC as Mock).mockResolvedValue(response);

        const result = await AuthController.generatePayload(payload);
        expect(AuthUC.generatePayloadUC).toHaveBeenCalledWith(payload);
        expect(result).toBe(response);
    });

    it('should call loginUC', async () => {
        const payload = { payload: 'xyz', signature: 'sig' } as unknown as Parameters<typeof AuthController.login>[0];
        (AuthUC.loginUC as Mock).mockResolvedValue({ jwt: 'token' });

        const result = await AuthController.login(payload);
        expect(AuthUC.loginUC).toHaveBeenCalledWith(payload);
        expect(result).toEqual({ jwt: 'token' });
    });

    it('should propagate errors from loginUC', async () => {
        const error = new Error("Fail");
        (AuthUC.loginUC as Mock).mockRejectedValue(error);
        await expect(AuthController.login({} as Parameters<typeof AuthController.login>[0])).rejects.toThrow("Fail");
    });

    it('should call getCurrentUserUC', async () => {
        const user = { id: '123' };
        (UserUC.getCurrentUserUC as Mock).mockResolvedValue(user);
        const result = await AuthController.getUserData();
        expect(UserUC.getCurrentUserUC).toHaveBeenCalled();
        expect(result).toEqual(user);
    });
});
