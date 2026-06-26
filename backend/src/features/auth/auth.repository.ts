import { AUTH as AUTH_CONST } from '../../config/constants';
import type { IUser } from '../../db/models/User';
import { UserModel } from '../../db/models/User';

export class AuthRepository {
  /**
   * Finds a user by email, returning a plain object.
   */
  async findByEmail(email: string): Promise<IUser | null> {
    const user = await UserModel.findOne({ email }).lean();
    return user ? (user as unknown as IUser) : null;
  }

  /**
   * Finds a user by ID, returning a plain object.
   */
  async findById(id: string): Promise<IUser | null> {
    const user = await UserModel.findById(id).lean();
    return user ? (user as unknown as IUser) : null;
  }

  /**
   * Creates a new user in the database.
   */
  async createUser(data: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(data);
    await user.save();
    return user.toObject() as IUser;
  }

  /**
   * Updates a user's fields by ID.
   */
  async updateUser(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    const user = await UserModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    return user ? (user as unknown as IUser) : null;
  }

  /**
   * Increments the token version for a user (used for global logout/invalidation).
   */
  async incrementTokenVersion(id: string): Promise<number | null> {
    const user = await UserModel.findByIdAndUpdate(
      id,
      { $inc: { tokenVersion: 1 } },
      { new: true }
    ).lean();
    return user ? user.tokenVersion : null;
  }

  /**
   * Deletes a user by ID.
   */
  async deleteUser(id: string): Promise<void> {
    await UserModel.findByIdAndDelete(id);
  }

  /**
   * Pushes a refresh token hash to the user's stored hashes array.
   * Used for refresh token rotation validation.
   */
  async pushRefreshTokenHash(userId: string, hash: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      $push: { refreshTokenHashes: { $each: [hash], $slice: -AUTH_CONST.REFRESH_TOKEN_ARRAY_MAX } },
    });
  }

  /**
   * Removes a refresh token hash by value using atomic $pull.
   * Returns true if the hash was actually found and removed (prevents race conditions).
   */
  async consumeRefreshTokenHash(userId: string, hash: string): Promise<boolean> {
    const result = await UserModel.updateOne(
      { _id: userId, refreshTokenHashes: hash },
      { $pull: { refreshTokenHashes: hash } }
    );
    return result.modifiedCount > 0;
  }

  /**
   * Clears all refresh token hashes (used on global logout).
   */
  async clearRefreshTokenHashes(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      $set: { refreshTokenHashes: [] },
    });
  }
}

export const authRepository = new AuthRepository();
