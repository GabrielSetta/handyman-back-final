import { RankingRepository } from '../../repositories/ranking/RankingRepository';
import { AspectoPositivo, AspectoNegativo, EstatisticasRanking, ConfiguracaoScore } from '../../types/rankingType';
import { CustomError } from '../CustomError';

export class RankingService {
    private rankingRepository: RankingRepository;
    
    // Configuração de pontos para cada aspecto
    private configuracaoScore: ConfiguracaoScore[] = [
        // Aspectos Positivos
        { aspecto: AspectoPositivo.AJUDOU_NO_PROCESSO, pontos: 5, tipo: 'positivo' },
        { aspecto: AspectoPositivo.FOI_EDUCADO, pontos: 3, tipo: 'positivo' },
        { aspecto: AspectoPositivo.PAGAMENTO_PONTUAL, pontos: 8, tipo: 'positivo' },
        { aspecto: AspectoPositivo.COMUNICACAO_CLARA, pontos: 4, tipo: 'positivo' },
        { aspecto: AspectoPositivo.FLEXIVEL_HORARIOS, pontos: 3, tipo: 'positivo' },
        { aspecto: AspectoPositivo.RESPEITOU_COMBINADO, pontos: 5, tipo: 'positivo' },
        
        // Aspectos Negativos
        { aspecto: AspectoNegativo.PAGAMENTO_ATRASADO, pontos: -10, tipo: 'negativo' },
        { aspecto: AspectoNegativo.COMUNICACAO_RUIM, pontos: -5, tipo: 'negativo' },
        { aspecto: AspectoNegativo.CANCELOU_SEM_MOTIVO, pontos: -15, tipo: 'negativo' },
        { aspecto: AspectoNegativo.DESRESPEITOU_HORARIO, pontos: -7, tipo: 'negativo' },
        { aspecto: AspectoNegativo.PEDIDO_URGENTE, pontos: -3, tipo: 'negativo' },
        { aspecto: AspectoNegativo.NEGOCIACAO_DIFÍCIL, pontos: -4, tipo: 'negativo' }
    ];

    constructor() {
        this.rankingRepository = new RankingRepository();
    }

    // Avaliar usuário após conclusão do serviço
    async avaliarUsuario(dados: {
        id_usuario: string;
        id_fornecedor: string;
        id_servico: string;
        aspectos_positivos: AspectoPositivo[];
        aspectos_negativos: AspectoNegativo[];
        comentario?: string;
    }): Promise<void> {
        try {
            // Verificar se já existe avaliação para este serviço
            const avaliacaoExistente = await this.rankingRepository.verificarAvaliacaoExistente(dados.id_servico);
            if (avaliacaoExistente) {
                throw new CustomError('Avaliação já realizada para este serviço', 400);
            }

            // Garantir que o usuário tenha um ranking inicial
            await this.rankingRepository.criarOuBuscarRanking(dados.id_usuario);

            // Salvar a avaliação
            await this.rankingRepository.salvarAvaliacao(dados);

            // Calcular pontos da nova avaliação
            const pontosAvaliacao = this.calcularPontosAvaliacao(dados.aspectos_positivos, dados.aspectos_negativos);

            // Buscar score atual e somar os novos pontos
            const rankingAtual = await this.rankingRepository.buscarRanking(dados.id_usuario);
            const scoreAtual = rankingAtual?.score || 0;
            const novoScore = Math.max(0, Math.min(100, scoreAtual + pontosAvaliacao));

            // Atualizar ranking do usuário (incrementa total_avaliacoes)
            await this.rankingRepository.atualizarScoreAposAvaliacao(dados.id_usuario, novoScore);

        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Erro ao avaliar usuário', 500);
        }
    }

    // Buscar estatísticas do usuário
    async buscarEstatisticasUsuario(id_usuario: string): Promise<EstatisticasRanking> {
        try {
            // Garantir que o usuário tenha um ranking
            await this.rankingRepository.criarOuBuscarRanking(id_usuario);
            
            return await this.rankingRepository.calcularEstatisticas(id_usuario);
        } catch (error) {
            throw new CustomError('Erro ao buscar estatísticas do usuário', 500);
        }
    }

    // Buscar ranking do usuário (para fornecedores verem antes de aceitar pedido)
    async buscarRankingUsuario(id_usuario: string): Promise<{
        nivel: string;
        score: number;
        total_avaliacoes: number;
        aspectos_negativos: Array<{
            aspecto: string;
            percentual: number;
        }>;
    }> {
        try {
            // Garantir que o usuário tenha um ranking
            await this.rankingRepository.criarOuBuscarRanking(id_usuario);
            
            const estatisticas = await this.rankingRepository.calcularEstatisticas(id_usuario);
            
            return {
                nivel: estatisticas.nivel_atual,
                score: estatisticas.score_atual,
                total_avaliacoes: estatisticas.total_avaliacoes,
                aspectos_negativos: estatisticas.aspectos_negativos.map(item => ({
                    aspecto: this.traduzirAspecto(item.aspecto),
                    percentual: item.percentual
                }))
            };
        } catch (error) {
            throw new CustomError('Erro ao buscar ranking do usuário', 500);
        }
    }

    // Calcular pontos da avaliação baseado nos aspectos avaliados
    private calcularPontosAvaliacao(aspectosPositivos: AspectoPositivo[], aspectosNegativos: AspectoNegativo[]): number {
        let pontosAdicionais = 0;

        // Calcular pontos dos aspectos positivos
        aspectosPositivos.forEach(aspecto => {
            const config = this.configuracaoScore.find(c => c.aspecto === aspecto);
            if (config) {
                pontosAdicionais += config.pontos;
            }
        });

        // Calcular pontos dos aspectos negativos
        aspectosNegativos.forEach(aspecto => {
            const config = this.configuracaoScore.find(c => c.aspecto === aspecto);
            if (config) {
                pontosAdicionais += config.pontos;
            }
        });

        return pontosAdicionais;
    }

    // Traduzir aspectos para português
    private traduzirAspecto(aspecto: AspectoPositivo | AspectoNegativo): string {
        const traducoes: Record<string, string> = {
            [AspectoPositivo.AJUDOU_NO_PROCESSO]: 'Ajudou no processo',
            [AspectoPositivo.FOI_EDUCADO]: 'Foi educado',
            [AspectoPositivo.PAGAMENTO_PONTUAL]: 'Pagamento pontual',
            [AspectoPositivo.COMUNICACAO_CLARA]: 'Comunicação clara',
            [AspectoPositivo.FLEXIVEL_HORARIOS]: 'Flexível com horários',
            [AspectoPositivo.RESPEITOU_COMBINADO]: 'Respeitou combinado',
            [AspectoNegativo.PAGAMENTO_ATRASADO]: 'Pagamento atrasado',
            [AspectoNegativo.COMUNICACAO_RUIM]: 'Comunicação ruim',
            [AspectoNegativo.CANCELOU_SEM_MOTIVO]: 'Cancelou sem motivo',
            [AspectoNegativo.DESRESPEITOU_HORARIO]: 'Desrespeitou horário',
            [AspectoNegativo.PEDIDO_URGENTE]: 'Pedido urgente',
            [AspectoNegativo.NEGOCIACAO_DIFÍCIL]: 'Negociação difícil'
        };

        return traducoes[aspecto] || aspecto;
    }

    // Obter configuração de aspectos para o frontend
    obterConfiguracaoAspectos(): {
        positivos: Array<{ valor: AspectoPositivo; label: string }>;
        negativos: Array<{ valor: AspectoNegativo; label: string }>;
    } {
        const positivos = [
            { valor: AspectoPositivo.AJUDOU_NO_PROCESSO, label: 'Ajudou no processo' },
            { valor: AspectoPositivo.FOI_EDUCADO, label: 'Foi educado' },
            { valor: AspectoPositivo.PAGAMENTO_PONTUAL, label: 'Pagamento pontual' },
            { valor: AspectoPositivo.COMUNICACAO_CLARA, label: 'Comunicação clara' },
            { valor: AspectoPositivo.FLEXIVEL_HORARIOS, label: 'Flexível com horários' },
            { valor: AspectoPositivo.RESPEITOU_COMBINADO, label: 'Respeitou combinado' }
        ];

        const negativos = [
            { valor: AspectoNegativo.PAGAMENTO_ATRASADO, label: 'Pagamento atrasado' },
            { valor: AspectoNegativo.COMUNICACAO_RUIM, label: 'Comunicação ruim' },
            { valor: AspectoNegativo.CANCELOU_SEM_MOTIVO, label: 'Cancelou sem motivo' },
            { valor: AspectoNegativo.DESRESPEITOU_HORARIO, label: 'Desrespeitou horário' },
            { valor: AspectoNegativo.PEDIDO_URGENTE, label: 'Pedido urgente' },
            { valor: AspectoNegativo.NEGOCIACAO_DIFÍCIL, label: 'Negociação difícil' }
        ];

        return { positivos, negativos };
    }
} 