import { MensagemView, NegociacoesView } from '../views/index';
import { Negociacoes, Negociacao, NegociacaoParcial } from '../models/index';
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

    constructor() {

        this._negociacoesView.update(this._negociacoes);
    }

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

        this._negociacoesView.update(this._negociacoes);
        this._mensagemView.update("Negociação adicionada com sucesso!");
    }

    @throttle()
    importarDados() {
        
        function isOk(res: Response){

            if (res.ok){
                return res;
            }
            else {
                throw new Error(res.statusText);
            }
        }

        fetch("http://localhost:8080/dados")
                .then(res => isOk(res))
                .then(res => res.json())
                .then((dados: NegociacaoParcial[]) => {
                    dados
                        .map(dado => new Negociacao(new Date(), dado.vezes, dado.montante))
                        .forEach(negociacao => this._negociacoes.adiciona(negociacao));

                    this._negociacoesView.update(this._negociacoes);
                })
                .catch(err => console.log(err));
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