import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';

import { AssignmentService } from './assignment.service';
import { successResponse } from '../../core/utils/response.util';
import { DeviceStatus } from '../device/device.entity';

@Controller('assignments')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  // -------------------------------
  // ASSIGN DEVICE
  // -------------------------------
  @Post()
  async assignDevice(
    @Body()
    body: {
      employeeId: string;
      deviceId: string;
      notes?: string;
      expectedReturnDate?: string | Date | null;
    },
  ) {
    const assignment = await this.assignmentService.assignDevice(body);

    return successResponse(
      assignment,
      'Device assigned successfully',
    );
  }

  // -------------------------------
  // RETURN DEVICE
  // -------------------------------
  @Post(':id/return')
  async returnDevice(
    @Param('id') id: string,
    @Body()
    body: {
      notes: string;
      deviceStatus: DeviceStatus;
    },
  ) {
    const updated = await this.assignmentService.returnDevice(
      id,
      body.notes,
      body.deviceStatus,
    );

    return successResponse(
      updated,
      'Device returned successfully',
    );
  }

  // -------------------------------
  // HISTORY (must be BEFORE :id)
  // -------------------------------
  @Get('history')
  async getHistory(
    @Query('employeeId') employeeId?: string,
    @Query('deviceId') deviceId?: string,
  ) {
    return successResponse(
      await this.assignmentService.getHistory(employeeId, deviceId),
    );
  }

  // -------------------------------
  // GET ASSIGNMENT BY ID
  // -------------------------------
  @Get(':id')
  async getAssignmentById(@Param('id') id: string) {
    const assignment =
      await this.assignmentService.getAssignmentById(id);

    return successResponse(assignment);
  }

  // -------------------------------
  // LIST ASSIGNMENTS
  // -------------------------------
  @Get()
  async listAssignments(
    @Query()
    query: {
      status?: string;
      employee?: string;
      deviceCategory?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
      page?: string;
      limit?: string;
    },
  ) {
    const result =
      await this.assignmentService.listAssignments(query);

    return successResponse({
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  }

  // -------------------------------
  // DELETE ASSIGNMENT
  // -------------------------------
  @Delete(':id')
  async deleteAssignment(@Param('id') id: string) {
    const result =
      await this.assignmentService.deleteAssignment(id);

    return successResponse(
      result,
      'Assignment deleted successfully',
    );
  }

    // -------------------------------
    // ACTIVE ASSIGNMENT COUNT
    // -------------------------------
    @Get('active/count')
    async getActiveCount() {
    const count = await this.assignmentService.getActiveAssignmentCount();

    return successResponse({ count });
    }
}
