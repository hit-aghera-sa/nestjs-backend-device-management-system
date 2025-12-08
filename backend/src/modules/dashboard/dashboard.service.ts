import EmployeeModel from "../employee/employee.model";
import DeviceModel from "../device/device.model";
import AssignmentModel from "../assignment/assignment.model";
import AppError from "../../core/errors/AppError";

class DashboardService {
  // ----------------------------------------
  // OVERVIEW METRICS
  // ----------------------------------------
  async getOverview() {
    const totalEmployees = await EmployeeModel.countDocuments();
    const totalDevices = await DeviceModel.countDocuments();

    const assignedDevices = await DeviceModel.countDocuments({ status: "ASSIGNED" });
    const availableDevices = await DeviceModel.countDocuments({ status: "AVAILABLE" });
    const damagedDevices = await DeviceModel.countDocuments({ status: "DAMAGED" });
    const maintenanceDevices = await DeviceModel.countDocuments({ status: "MAINTENANCE" });

    return {
      employees: { total: totalEmployees },
      devices: {
        total: totalDevices,
        assigned: assignedDevices,
        available: availableDevices,
        damaged: damagedDevices,
        maintenance: maintenanceDevices,
      },
    };
  }

  // ----------------------------------------
  // RECENT ASSIGNMENTS (Last 10)
  // ----------------------------------------
  async getRecentAssignments(limit = 10) {
    return AssignmentModel.find({})
      .populate("employee")
      .populate("device")
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  // ----------------------------------------
  // CATEGORY WISE STATS
  // Shows: category, total, assigned, available
  // ----------------------------------------
  async getCategoryStats() {
    const stats = await DeviceModel.aggregate([
      {
        $group: {
          _id: "$category",
          total: { $sum: 1 },
          assigned: {
            $sum: {
              $cond: [{ $eq: ["$status", "ASSIGNED"] }, 1, 0],
            },
          },
          available: {
            $sum: {
              $cond: [{ $eq: ["$status", "AVAILABLE"] }, 1, 0],
            },
          },
          damaged: {
            $sum: {
              $cond: [{ $eq: ["$status", "DAMAGED"] }, 1, 0],
            },
          },
          maintenance: {
            $sum: {
              $cond: [{ $eq: ["$status", "MAINTENANCE"] }, 1, 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return stats.map((s) => ({
      category: s._id,
      total: s.total,
      assigned: s.assigned,
      available: s.available,
      damaged: s.damaged,
      maintenance: s.maintenance,
    }));
  }
}

export default new DashboardService();
