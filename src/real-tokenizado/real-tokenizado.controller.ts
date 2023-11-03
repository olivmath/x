import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  RealTokenizadoMintDTO,
  RealTokenizadoBurnDTO,
  RealTokenizadoInternalTransferDTO,
  RealTokenizadoApproveBurnDTO,
} from '../dtos/real-tokenizado.dto';
import { RealTokenizadoService } from './real-tokenizado.service';

@Controller('real-tokenizado')
@ApiTags('Real Tokenizado Operations')
export class RealTokenizadoController {
  constructor(private readonly realTokenizadoService: RealTokenizadoService) { }

  @Post('mint')
  @ApiOperation({ summary: 'Mint Real Tokenizado', description: 'Mint Real Tokenizado token to an enabled wallet' })
  mint(@Body() dto: RealTokenizadoMintDTO) {
    return this.realTokenizadoService.mint(dto);
  }

  @Post('burn')
  @ApiOperation({ summary: 'Burn Real Tokenizado', description: 'Burn Real Tokenizado token from an enabled wallet' })
  burn(@Body() dto: RealTokenizadoBurnDTO) {
    return this.realTokenizadoService.burn(dto);
  }

  @Post('internal-transfer')
  @ApiOperation({ summary: 'Tranfer Real Tokenizado (Internal)', description: 'Transfer Real Tokenizado token between clients from the same financial institution' })
  transfer(@Body() dto: RealTokenizadoInternalTransferDTO,) {
    return this.realTokenizadoService.internalTransfer(dto);
  }

  @Get('balanceOf/:address')
  @ApiOperation({ summary: 'Real Tokenizado balance', description: 'Real Tokenizado balance of any address' })
  @ApiParam({ name: 'address', example: '0x5be4C55e1977E555DB9a815a2CDed576A71Ca3c2' })
  balanceOf(@Param('address') address: string) {
    return this.realTokenizadoService.balanceOf(address);
  }

  @Post('approve-burn')
  @ApiOperation({ summary: 'Approve Real Tokenizado Burn', description: 'Approve a Real Tokenizado Burn transaction' })
  approveBurn(@Body() dto: RealTokenizadoApproveBurnDTO) {
    return this.realTokenizadoService.approveBurn(dto);
  }
}
