import { Request, Response, NextFunction } from "express";
import AssignmentService from "./assignment.service";
import { successResponse } from "../../core/utils/response.util";
import AssignmentRepository from "./assignment.repository";
import AssignmentModel from "./assignment.model";

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

      const updated = await AssignmentService.returnDevice(
        id,
        notes,
        deviceStatus
      );

      return res
        .status(200)
        .json(successResponse(updated, "Device returned successfully"));
    } catch (err) {
      next(err);
    }
  }

  async getAssignmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const assignment = await AssignmentService.getAssignmentById(
        req.params.id
      );
      return res.status(200).json(successResponse(assignment));
    } catch (err) {
      next(err);
    }
  }

  async listAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const filter: any = {};

      // Status
      if (typeof req.query.status === "string") {
        filter.status = req.query.status;
      }

      // Employee
      if (typeof req.query.employee === "string") {
        filter.employee = req.query.employee;
      }

      // Category
      if (typeof req.query.deviceCategory === "string") {
        filter.deviceCategory = req.query.deviceCategory;
      }

      // Date Range
      if (req.query.startDate || req.query.endDate) {
        filter.assignedAt = {};

        if (typeof req.query.startDate === "string") {
          filter.assignedAt.$gte = new Date(req.query.startDate);
        }

        if (typeof req.query.endDate === "string") {
          filter.assignedAt.$lte = new Date(req.query.endDate);
        }
      }

      // Search (notes + status)
      if (typeof req.query.search === "string" && req.query.search.trim()) {
        const search = new RegExp(req.query.search, "i");
        filter.$or = [{ notes: search }, { status: search }];
      }

      // Repository Query
      const query = AssignmentRepository.listAssignments(filter);

      const data = await query.skip(skip).limit(limit).exec();
      const total = await AssignmentModel.countDocuments(filter);

      return res.json({
        status: "success",
        data, // array — Angular .map() works
        total,
        page,
        limit,
      });
    } catch (err) {
      console.error(err);
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
