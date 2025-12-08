import DeviceModel, { IDevice } from "./device.model";

class DeviceRepository {
  async create(data: Partial<IDevice>) {
    return DeviceModel.create(data);
  }

  async findAll(filter: any = {}) {
    return DeviceModel.find(filter).exec();
  }

  async findById(id: string) {
    return DeviceModel.findById(id).exec();
  }

  async findBySerial(serialNumber: string) {
    return DeviceModel.findOne({ serialNumber }).exec();
  }

  async update(id: string, data: Partial<IDevice>) {
    return DeviceModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string) {
    return DeviceModel.findByIdAndDelete(id).exec();
  }
}

export default new DeviceRepository();

