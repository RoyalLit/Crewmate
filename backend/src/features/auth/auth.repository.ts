import { UserModel, IUser } from '../../db/models/User';

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
}

export const authRepository = new AuthRepository();
