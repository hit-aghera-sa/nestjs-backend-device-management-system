import { AppDataSource } from "../../config/typeorm.config";
import { Admin } from "./admin.entity";

class AdminRepository {
  private repo = AppDataSource.getRepository(Admin);

  async create(data: Partial<Admin>) {
    const admin = this.repo.create(data);
    return this.repo.save(admin);
  }

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async findByVerificationToken(token: string) {
    return this.repo.findOne({ where: { verificationToken: token } });
  }

  async markVerified(id: string) {
    await this.repo.update(
      { id },
      {
        isVerified: true,
        verificationToken: null,
        verificationExpires: null,
      }
    );
    return this.findById(id);
  }

  async setVerificationToken(id: string, token: string, expires: Date) {
    await this.repo.update(
      { id },
      {
        verificationToken: token,
        verificationExpires: expires,
      }
    );
    return this.findById(id);
  }

  async updatePassword(id: string, hashed: string) {
    await this.repo.update({ id }, { password: hashed });
    return this.findById(id);
  }

  async findAll() {
    return this.repo.find();
  }

  async update(id: string, data: Partial<Admin>) {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }
}

export default new AdminRepository();
