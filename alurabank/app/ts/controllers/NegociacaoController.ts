import { MensagemView, NegociacoesView } from '../views/index';
import { Negociacoes, Negociacao, NegociacaoParcial } from '../models/index';
import { NegociacaoService } from '../services/index';
import { imprime } from '../helpers/index';
import { domInject, throttle } from '../helpers/decorators/index';

let timer = 0;

export class NegociacaoController {

    @domInject('#data')
    private _inputData: JQuery;
    @domInject('#quantidade')
    private _inputQuantidade: JQuery;
    @domInject('#valor')
    private _inputValor: JQuery;

    private _negociacoes: Negociacoes = new Negociacoes();
    private _negociacoesView = new NegociacoesView("#negociacoesView");
    private _mensagemView = new MensagemView("#mensagemView");

    private _service = new NegociacaoService;

    constructor() {

        this._negociacoesView.update(this._negociacoes);
    }

    @throttle()
    adiciona() {

        let date = new Date(this._inputData.val().replace(/-/g, ","));

        if (!this._ehDiaUtil(date)) {
            this._mensagemView.update("Somente dia útil!");
            return;
        }

        const negociacao = new Negociacao(
            date,
            parseInt(this._inputQuantidade.val()),
            parseFloat(this._inputValor.val())
        );

        this._negociacoes.adiciona(negociacao);

        imprime(negociacao, this._negociacoes);

        this._negociacoesView.update(this._negociacoes);
        this._mensagemView.update("Negociação adicionada com sucesso!");
    }

    @throttle()
    async importarDados() {
        
        try {

            function isOk(res: Response){

                if (res.ok){
                    return res;
                }
                else {
                    throw new Error(res.statusText);
                }
            }
    
            const negociacoesParaImportar = await this._service.obterNegociacoes(isOk);
    
            const negociacoesJaImportadas = this._negociacoes.paraArray();
    
            let paraImportar = negociacoesParaImportar.filter(negociacao =>
                !negociacoesJaImportadas.some(JaImportada => negociacao.ehIgual(JaImportada)));
    
            if (paraImportar.length > 0) {
    
                paraImportar.forEach(negociacao => this._negociacoes.adiciona(negociacao));
    
                this._negociacoesView.update(this._negociacoes);
    
                imprime(this._negociacoes);
            }
        }
        catch (err) {
            this._mensagemView.update(err.message);
        }
    }

    private _ehDiaUtil(date: Date): boolean {

        return date.getDay() != DiaDaSemana.Domingo && date.getDay() != DiaDaSemana.Sabado;
    }
}

enum DiaDaSemana {
    Domingo,
    Segunda,
    Terca,
    Quarta,
    Quinta,
    Sexta,
    Sabado
}