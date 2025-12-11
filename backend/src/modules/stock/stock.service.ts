import DeviceModel from "../device/device.model";

class StockService {
  private LOW_STOCK_THRESHOLD = 5;

  // ----------------------------------------
  // Available devices grouped by category
  // Includes total and available counts per category
  // ----------------------------------------
  async getAvailableStock() {
    // 1. Get total devices per category
    const totals = await DeviceModel.aggregate([
      {
        $group: {
          _id: "$category",
          total: { $sum: 1 }
        }
      }
    ]);

    // 2. Get available devices per category
    const available = await DeviceModel.aggregate([
      { $match: { status: "AVAILABLE" } },
      {
        $group: {
          _id: "$category",
          available: { $sum: 1 }
        }
      }
    ]);

    const totalMap = new Map();
    const availableMap = new Map();

    totals.forEach(t => totalMap.set(t._id, t.total));
    available.forEach(a => availableMap.set(a._id, a.available));

    const merged = [...totalMap.keys()].map(category => ({
      category,
      total: totalMap.get(category),
      available: availableMap.get(category) || 0
    }));

    return merged;
  }

  // ----------------------------------------
  // Low stock by category (available < threshold)
  // Returns only categories below threshold
  // ----------------------------------------
  async getLowStock() {
    const stock = await this.getAvailableStock();

    return stock
      .filter(item => item.available < this.LOW_STOCK_THRESHOLD)
      .map(item => ({
        category: item.category,
        available: item.available,
        threshold: this.LOW_STOCK_THRESHOLD
      }));
  }
}

export default new StockService();
