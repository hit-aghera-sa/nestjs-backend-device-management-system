import AdminModel, { IAdmin } from "./admin.model";

class AdminRepository {
  async create(data: Partial<IAdmin>) {
    return AdminModel.create(data);
  }

  async findByEmail(email: string) {
    return AdminModel.findOne({ email }).exec();
  }

  async findById(id: string) {
    return AdminModel.findById(id).exec();
  }

  async findByVerificationToken(token: string) {
    return AdminModel.findOne({ verificationToken: token }).exec();
  }

  async markVerified(id: string) {
    return AdminModel.findByIdAndUpdate(id, { isVerified: true, verificationToken: null, verificationExpires: null }, { new: true }).exec();
  }

  async setVerificationToken(id: string, token: string, expires: Date) {
    return AdminModel.findByIdAndUpdate(id, { verificationToken: token, verificationExpires: expires }, { new: true }).exec();
  }

  async updatePassword(id: string, hashed: string) {
    return AdminModel.findByIdAndUpdate(id, { password: hashed }, { new: true }).exec();
  }
}

export default new AdminRepository();

