import AssignmentModel, { IAssignment } from "./assignment.model";

class AssignmentRepository {
  async create(data: Partial<IAssignment>) {
    return AssignmentModel.create(data);
  }

  async findActiveByDevice(deviceId: string) {
    return AssignmentModel.findOne({ device: deviceId, status: "ASSIGNED" })
      .populate("employee")
      .populate("device")
      .exec();
  }

  async findActiveByEmployee(employeeId: string) {
    return AssignmentModel.findOne({ employee: employeeId, status: "ASSIGNED" })
      .populate("employee")
      .populate("device")
      .exec();
  }

  async findById(id: string) {
    return AssignmentModel.findById(id)
      .populate("employee")
      .populate("device")
      .exec();
  }

  async listAssignments(filter: any = {}) {
    return AssignmentModel.find(filter)
      .populate("employee")
      .populate("device")
      .exec();
  }

  async markReturned(id: string, notes?: string) {
    return AssignmentModel.findByIdAndUpdate(
      id,
      { status: "RETURNED", returnedAt: new Date(), notes },
      { new: true }
    )
      .populate("employee")
      .populate("device")
      .exec();
  }
  async delete(id: string) {
  return AssignmentModel.findByIdAndDelete(id).exec();
}

}

export default new AssignmentRepository();


