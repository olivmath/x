import { TransactionsService } from 'src/transactions/transactions.service';
import { ContractHelperService } from 'src/helpers/contract-helper/contract-helper.service';
import ContractWrapper from 'src/utils/contract-util/contract-wrapper';
import { ParfinService } from 'src/parfin/parfin.service';
import { Injectable } from '@nestjs/common';
import {
    AssetTypes,
    TransactionOperations,
} from '../types/transactions.types';
import {
    RealTokenizadoMintDTO,
    RealTokenizadoBurnDTO,
    RealTokenizadoInternalTransferDTO,
} from '../dtos/real-tokenizado.dto';
import {
    ParfinContractCallSuccessRes,
    ParfinSuccessRes,
} from 'src/res/app/parfin.responses';
import { LoggerService } from 'src/logger/logger.service';
import { ParfinContractInteractDTO } from 'src/dtos/parfin.dto';
import { AssetID } from '../types/wallet.types';

@Injectable()
export class RealTokenizadoService {
    keyDictionary: ContractWrapper;
    realTokenizado: ContractWrapper;
    constructor(
        private readonly transactionService: TransactionsService,
        private readonly contractHelper: ContractHelperService,
        private readonly parfinService: ParfinService,
        private readonly logger: LoggerService,
    ) {
        this.realTokenizado =
            this.contractHelper.getContractMethods('RealTokenizado');
        this.keyDictionary =
            this.contractHelper.getContractMethods('KeyDictionary');
        this.logger.setContext('RealTokenizadoService');
    }

    async mint(dto: RealTokenizadoMintDTO): Promise<any> {
        const { description, to, amount } = dto as RealTokenizadoMintDTO;
        const parfinDTO = new ParfinContractInteractDTO();
        const { blockchainId, ...parfinSendDTO } = parfinDTO;
        parfinSendDTO.description = description;
        parfinSendDTO.source = {
            assetId: AssetID.realTokenizado,
        };

        try {
            // 1. ???
            const address = process.env.REAL_TOKENIZADO_ADDRESS;

            // 2. ???
            parfinSendDTO.metadata = {
                data: '',
                contractAddress: address,
            };
            parfinSendDTO.metadata.data = this.realTokenizado.mint(to, amount)[0];

            // 3. ???
            const parfinSendRes = await this.parfinService.smartContractSend(
                parfinSendDTO,
            );
            const { id: transactionId } = parfinSendRes as ParfinSuccessRes;
            if (!transactionId) {
                throw new Error(
                    `[ERROR]: Erro ao tentar interagir com contrato Real Tokenizado (Banco Arbi). Parfin Send DTO: ${parfinSendDTO}`
                );
            }

            // 4. ???
            const transactionData = {
                parfinTransactionId: transactionId,
                operation: TransactionOperations.MINT,
                asset: AssetTypes.RT,
                ...parfinSendDTO,
            };

            const { id: dbTransactionId } =
                await this.transactionService.create(transactionData);
            if (!dbTransactionId) {
                throw new Error(
                    `[ERROR]: Erro ao tentar salvar a transação ${transactionId} no banco. Payload: ${transactionData}`
                );
            }

            // 5. ???
            const { statusDescription } = await this.transactionService.transactionSignAndPush(
                transactionId,
                dbTransactionId,
            );
            if (!statusDescription) {
                throw new Error(`[ERROR]: Erro ao tentar assinar a transação ${transactionId}. Payload: ${transactionData}`);
            }

            return statusDescription;

        } catch (error) {
            this.logger.log(error);
            throw new Error(
                `[ERROR]: Erro ao tentar fazer emissão de $${amount} Real Tokenizado para a carteira ${to}. 
                Parfin Send DTO: ${parfinSendDTO}`
            );
        }
    }

    async burn(dto: RealTokenizadoBurnDTO): Promise<any> {
        const { description, amount } = dto as RealTokenizadoBurnDTO;
        const parfinDTO = new ParfinContractInteractDTO();
        const { blockchainId, ...parfinSendDTO } = parfinDTO;
        parfinSendDTO.description = description;
        parfinSendDTO.source = {
            assetId: AssetID.realDigital,
        };

        try {
            // 1. ???
            const address = process.env.REAL_TOKENIZADO_ADDRESS;

            // 2. ???
            parfinSendDTO.metadata = {
                data: '',
                contractAddress: address,
            };
            parfinSendDTO.metadata.data = this.realTokenizado.burn(amount)[0];

            // 3. ???
            const parfinSendRes = await this.parfinService.smartContractSend(
                parfinSendDTO,
            );
            const { id: transactionId } = parfinSendRes as ParfinSuccessRes;
            if (!transactionId) {
                throw new Error(
                    `[ERROR]: Erro ao tentar interagir com contrato Real Tokenizado. Parfin Send DTO: ${parfinSendDTO}`
                );
            }

            // 4. ???
            const transactionData = {
                parfinTransactionId: transactionId,
                operation: TransactionOperations.BURN,
                asset: AssetTypes.RT,
                ...parfinSendDTO,
            };

            const { id: dbTransactionId } =
                await this.transactionService.create(transactionData);
            if (!dbTransactionId) {
                throw new Error(
                    `[ERROR]: Erro ao tentar salvar a transação ${transactionId} no banco. Payload: ${transactionData}`
                );
            }

            // 5. ???
            const { statusDescription } = await this.transactionService.transactionSignAndPush(
                transactionId,
                dbTransactionId,
            );
            if (!statusDescription) {
                throw new Error(`[ERROR]: Erro ao tentar assinar a transação ${transactionId}. Payload: ${transactionData}`);
            }

            return statusDescription;

        } catch (error) {
            this.logger.log(error);
            throw new Error(
                `[ERROR]: Erro ao tentar fazer o resgate de $${amount} Real Tokenizado. Parfin Send DTO: ${parfinSendDTO}`
            );
        }
    }

    async internalTransfer(
        dto: RealTokenizadoInternalTransferDTO,
    ): Promise<any> {
        const { description, key, amount } = dto as RealTokenizadoInternalTransferDTO;
        const parfinDTO = new ParfinContractInteractDTO();
        const parfinCallDTO = {
            metadata: parfinDTO.metadata,
            blockchainId: parfinDTO.blockchainId,
        };

        try {
            // 1. ???
            const keyDictionary = 'KeyDictionary';
            const { address: keyDictionaryAddress } = await this.contractHelper.getContractAddress(keyDictionary);
            if (!keyDictionaryAddress) {
                throw new Error(`[ERROR]: Erro ao buscar o contrato ${keyDictionary}`);
            }

            // 2. ???
            parfinCallDTO.metadata = {
                data: '',
                contractAddress: keyDictionaryAddress,
            };
            parfinCallDTO.metadata.data = this.keyDictionary.getWallet(key)[0];

            // 3. ???
            const parfinCallRes = await this.parfinService.smartContractCall(
                parfinCallDTO,
            );
            const { data } = parfinCallRes as ParfinContractCallSuccessRes;
            if (!data) {
                throw new Error(
                    `[ERROR]: Erro ao tentar interagir com contrato ${keyDictionary}. Parfin Call DTO: ${parfinCallDTO}`
                );
            }

            // 4. ???
            const receiverAddress = this.keyDictionary.getWallet({
                returned: data,
            })[0];

            // 5. ???
            const parfinDTO = new ParfinContractInteractDTO();
            const { blockchainId, ...parfinSendDTO } = parfinDTO;
            parfinSendDTO.description = description;
            parfinSendDTO.source = {
                assetId: AssetID.realTokenizado,
            };

            // 6. ???
            const address = process.env.REAL_TOKENIZADO_ADDRESS;

            // 7. ???
            parfinSendDTO.metadata = {
                data: '',
                contractAddress: address,
            };
            parfinSendDTO.metadata.data = this.realTokenizado.transfer(
                receiverAddress,
                amount,
            )[0];

            // 8. ???
            const parfinSendRes =
                await this.parfinService.smartContractSend(
                    parfinSendDTO,
                );
            const { id: transactionId } = parfinSendRes as ParfinSuccessRes;
            if (!transactionId) {
                throw new Error(
                    `[ERROR]: Erro ao tentar interagir com contrato Real Tokenizado. Parfin Send DTO: ${parfinSendDTO}`
                );
            }

            // 9. ???
            const transactionData = {
                parfinTransactionId: transactionId,
                operation: TransactionOperations.TRANSFER,
                asset: AssetTypes.RD,
                ...parfinSendDTO,
            };

            const { id: dbTransactionId } =
                await this.transactionService.create(
                    transactionData,
                );
            if (!dbTransactionId) {
                throw new Error(
                    `[ERROR]: Erro ao tentar salvar a transação ${transactionId} no banco. Payload: ${transactionData}`
                );
            }

            // 10. ???
            const { statusDescription } = await this.transactionService.transactionSignAndPush(
                transactionId,
                dbTransactionId,
            );
            if (!statusDescription) {
                throw new Error(`[ERROR]: Erro ao tentar assinar a transação ${transactionId}. Payload: ${transactionData}`);
            }
            return statusDescription;
        } catch (error) {
            this.logger.log(error);
            throw new Error(
                `[ERROR]: Erro ao tentar transferir $${amount} Real Digital para o CPF hash: ${key}`
            );
        }
    }
}
