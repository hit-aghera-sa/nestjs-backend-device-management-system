// import { Controller, Post, Get, Delete, Param } from "@nestjs/common";
// import { Request, Response, NextFunction } from "express";
// // import { AssignmentService } from "./assignment.service";
// import { successResponse } from "../../core/utils/response.util";

// @Controller("assignment")
// export class AssignmentController {
//   constructor(private readonly assignmentService: AssignmentService) {}

//   @Post()
//   async assignDevice(req: Request, res: Response, next: NextFunction) {
//     try {
//       const assignment = await this.assignmentService.assignDevice(req.body);
//       return res
//         .status(201)
//         .json(successResponse(assignment, "Device assigned successfully"));
//     } catch (err) {
//       next(err);
//     }
//   }

//   @Post(":id/return")
//   async returnDevice(req: Request, res: Response, next: NextFunction) {
//     try {
//       const { id } = req.params;
//       const { notes, deviceStatus } = req.body;

//       const updated = await this.assignmentService.returnDevice(
//         id,
//         notes,
//         deviceStatus
//       );

//       return res
//         .status(200)
//         .json(successResponse(updated, "Device returned successfully"));
//     } catch (err) {
//       next(err);
//     }
//   }

//   @Get(":id")
//   async getAssignmentById(req: Request, res: Response, next: NextFunction) {
//     try {
//       const { id } = req.params;
//       const result = await this.assignmentService.deleteAssignment(id);
//       return res.status(200).json(successResponse(result));
//     } catch (err) {
//       next(err);
//     }
//   }

//   @Get()
//   async listAssignments(req: Request, res: Response, next: NextFunction) {
//     try {
//       const filter: any = {
//         status: req.query.status,
//         employee: req.query.employee,
//         deviceCategory: req.query.deviceCategory,
//         startDate: req.query.startDate,
//         endDate: req.query.endDate,
//         search: req.query.search,
//         page: req.query.page,
//         limit: req.query.limit,
//       };

//       const result = await this.assignmentService.listAssignments(filter);

//       return res.status(200).json(
//         successResponse({
//           data: result.data,
//           total: result.total,
//           page: result.page,
//           limit: result.limit,
//         })
//       );
//     } catch (err) {
//       next(err);
//     }
//   }

//   @Delete(":id")
//   async deleteAssignment(req: Request, res: Response, next: NextFunction) {
//     try {
//       const { id } = req.params;
//       const result = await this.assignmentService.deleteAssignment(id);
//       return res
//         .status(200)
//         .json(successResponse(result, "Assignment deleted successfully"));
//     } catch (err) {
//       next(err);
//     }
//   }
// }
