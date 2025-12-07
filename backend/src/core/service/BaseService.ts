import NotFoundError from "../errors/NotFoundError";

export default class BaseService<T> {
  private repository: any;

  constructor(repository: any) {
    this.repository = repository;
  }

  async getById(id: string) {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundError();
    return item;
  }

  async getAll(filter: any = {}) {
    return this.repository.findAll(filter);
  }

  async create(data: Partial<T>) {
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<T>) {
    return this.repository.update(id, data);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}

