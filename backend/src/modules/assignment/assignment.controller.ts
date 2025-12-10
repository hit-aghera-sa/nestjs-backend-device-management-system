import { Request, Response, NextFunction } from "express";
import AssignmentService from "./assignment.service";
import { successResponse } from "../../core/utils/response.util";

class AssignmentController {
  async assignDevice(req: Request, res: Response, next: NextFunction) {
    try {
      const assignment = await AssignmentService.assignDevice(req.body);
      return res
        .status(201)
        .json(successResponse(assignment, "Device assigned successfully"));
    } catch (err) {
      next(err);
    }
  }

  async returnDevice(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { notes, deviceStatus } = req.body;
      const updated = await AssignmentService.returnDevice(id, notes, deviceStatus);
      return res
        .status(200)
        .json(successResponse(updated, "Device returned successfully"));
    } catch (err) {
      next(err);
    }
  }

  async getAssignmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const assignment = await AssignmentService.getAssignmentById(req.params.id);
      return res.status(200).json(successResponse(assignment));
    } catch (err) {
      next(err);
    }
  }

  async listAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      const assignments = await AssignmentService.listAssignments(req.query);
      return res.status(200).json(successResponse(assignments));
    } catch (err) {
      next(err);
    }
  }
  async deleteAssignment(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const result = await AssignmentService.deleteAssignment(id);
    return res
      .status(200)
      .json(successResponse(result, "Assignment deleted successfully"));
  } catch (err) {
    next(err);
  }
}

}

export default new AssignmentController();
