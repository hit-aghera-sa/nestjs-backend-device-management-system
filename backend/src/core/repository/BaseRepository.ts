export default class BaseRepository<T> {
  private model: any;

  constructor(model: any) {
    this.model = model;
  }

  create(data: Partial<T>) {
    return this.model.create(data);
  }

  findById(id: string) {
    return this.model.findById(id);
  }

  findOne(filter: any) {
    return this.model.findOne(filter);
  }

  findAll(filter: any = {}) {
    return this.model.find(filter);
  }

  update(id: string, data: Partial<T>) {
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }

  delete(id: string) {
    return this.model.findByIdAndDelete(id);
  }
}

