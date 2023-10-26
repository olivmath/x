import ParfinContractWrapper from './contract-wrapper';
import abiLoader from '../../helpers/abi-loader';

describe('ParfinContractWrapper', () => {
    let parfinContractWrapper = new ParfinContractWrapper(
        abiLoader.RealDigital,
    );

    it('deve criar uma instância de ParfinContractWrapper corretamente', () => {
        expect(parfinContractWrapper).toBeInstanceOf(ParfinContractWrapper);
    });

    it('deve retornar o contrato corretamente', () => {
        expect(parfinContractWrapper).toBeDefined();
    });

    it('deve retornar o todas methods do abi corretamente', () => {
        expect(
            Object.getOwnPropertyNames(parfinContractWrapper).length,
        ).toEqual(62);
    });

    it('deve retornar o hex para uma chamada de uma funcao qualquer do abi', () => {
        const encodedCall = parfinContractWrapper['approve(address,uint256)'](
            '0xf2e05Efe980110EBA4a5521C4D9FCEA3eeCE33F4',
            1000,
        );
        expect(encodedCall).toEqual([
            '0x095ea7b3' +
                '000000000000000000000000f2e05efe980110eba4a5521c4d9fcea3eece33f4' +
                '00000000000000000000000000000000000000000000000000000000000003e8',
        ]);
    });

    it('deve retornar o valor decodificado para o retorno de uma chamada de funcao qualquer do abi', () => {
        const decodedReturn = parfinContractWrapper['approve'](
            '0x0000000000000000000000000000000000000000000000000000000000000001',
        );
        expect(decodedReturn).toEqual([true]);
    });
});
