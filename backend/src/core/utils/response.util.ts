export function successResponse(data: any, message = "Success") {
  return { status: "success", message, data };
}

