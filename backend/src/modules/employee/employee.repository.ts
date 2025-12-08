import EmployeeModel, { IEmployee } from "./employee.model";

class EmployeeRepository {
  async create(data: Partial<IEmployee>) {
    return EmployeeModel.create(data);
  }

  async findByEmail(email: string) {
    return EmployeeModel.findOne({ email }).exec();
  }

  async findByVerificationToken(token: string) {
    return EmployeeModel.findOne({ verificationToken: token }).exec();
  }

  async findById(id: string) {
    return EmployeeModel.findById(id).exec();
  }

  async findAll(filter: any = {}) {
    return EmployeeModel.find(filter).exec();
  }

  async update(id: string, data: Partial<IEmployee>) {
    return EmployeeModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string) {
    return EmployeeModel.findByIdAndDelete(id).exec();
  }

  async setVerificationToken(id: string, token: string, expires: Date) {
    return EmployeeModel.findByIdAndUpdate(
      id,
      { verificationToken: token, verificationExpires: expires },
      { new: true }
    ).exec();
  }

  async verifyEmployee(id: string) {
    return EmployeeModel.findByIdAndUpdate(
      id,
      { isVerified: true, verificationToken: null, verificationExpires: null },
      { new: true }
    ).exec();
  }
}

export default new EmployeeRepository();

