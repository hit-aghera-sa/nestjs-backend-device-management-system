import { AppDataSource } from "../../config/typeorm.config";
import { Employee } from "./employee.entity";
import { FindOptionsWhere } from "typeorm";

class EmployeeRepository {
  private repo = AppDataSource.getRepository(Employee);

  async create(data: Partial<Employee>) {
    const employee = this.repo.create(data);
    return this.repo.save(employee);
  }

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async findByVerificationToken(token: string) {
    return this.repo.findOne({ where: { verificationToken: token } });
  }

  async findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async findAll(filter: FindOptionsWhere<Employee> = {}) {
    return this.repo.find({ where: filter });
  }

  async update(id: string, data: Partial<Employee>) {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }

  async delete(id: string) {
    const entity = await this.findById(id);
    if (!entity) return null;
    await this.repo.remove(entity);
    return entity;
  }

  async setVerificationToken(id: string, token: string, expires: Date) {
    await this.repo.update(
      { id },
      { verificationToken: token, verificationExpires: expires }
    );
    return this.findById(id);
  }

  async verifyEmployee(id: string) {
    await this.repo.update(
      { id },
      { isVerified: true, verificationToken: null, verificationExpires: null }
    );
    return this.findById(id);
  }
}

export default new EmployeeRepository();
