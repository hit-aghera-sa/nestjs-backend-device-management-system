import { AppDataSource } from "../../config/typeorm.config";
import { Device } from "./device.entity";
import { FindOptionsWhere } from "typeorm";

class DeviceRepository {
  private repo = AppDataSource.getRepository(Device);

  async create(data: Partial<Device>) {
    const device = this.repo.create(data);
    return this.repo.save(device);
  }

  async findAll(filter: FindOptionsWhere<Device> = {}) {
    return this.repo.find({ where: filter });
  }

  async findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async findBySerial(serialNumber: string) {
    return this.repo.findOne({ where: { serialNumber } });
  }

  async update(id: string, data: Partial<Device>) {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }

  async delete(id: string) {
    const entity = await this.findById(id);
    if (!entity) return null;
    await this.repo.remove(entity);
    return entity;
  }
}

export default new DeviceRepository();
