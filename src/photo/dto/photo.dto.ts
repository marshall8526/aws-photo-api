export class PhotoDto {
  name: string;
  url: string;

  static toDto(data: any): PhotoDto {
    const dto = new PhotoDto();
    dto.name = data.name;
    dto.url = data.url;
    return dto;
  }
}