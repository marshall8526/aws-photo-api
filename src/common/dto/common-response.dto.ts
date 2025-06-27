export class CommonResponseDto {
  data: any = null;
  error: any = null;
  timestamp: string = new Date().toISOString();

  static setData(data: any): CommonResponseDto {
    const dto = new CommonResponseDto();
    dto.data = data;
    return dto;
  }
}