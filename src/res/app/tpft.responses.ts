import { ApiProperty } from "@nestjs/swagger";

export class TPFtGetBalanceOfSuccessRes {
  @ApiProperty({ description: 'ID do TPFt (1, 2, etc.)' })
  tpftID: string;
  @ApiProperty({ description: 'Nome do TPFt (LTN, LFT, etc.)' })
  tpftAcronym: string;
  @ApiProperty({ description: 'Saldo do TPFt na carteira' })
  tpftBalanceOf: string;
  @ApiProperty({ description: 'Data de validade do TPFt' })
  expirationDate: Date;
  @ApiProperty({ description: 'Diz se o TPFt está vencido' })
  isExpired: boolean;
}