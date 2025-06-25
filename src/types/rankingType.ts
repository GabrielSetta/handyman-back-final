export interface RankingUsuario {
    id_usuario: string;
    score: number;
    nivel: NivelRanking;
    total_avaliacoes: number;
    data_criacao: Date;
    data_atualizacao: Date;
}

export enum NivelRanking {
    BRONZE = 'Bronze',
    PRATA = 'Prata',
    OURO = 'Ouro',
    PLATINA = 'Platina',
    DIAMANTE = 'Diamante'
}

export interface AvaliacaoUsuario {
    id: string;
    id_usuario: string;
    id_fornecedor: string;
    id_servico: string;
    aspectos_positivos: AspectoPositivo[];
    aspectos_negativos: AspectoNegativo[];
    comentario?: string;
    data_avaliacao: Date;
}

export enum AspectoPositivo {
    AJUDOU_NO_PROCESSO = 'ajudou_no_processo',
    FOI_EDUCADO = 'foi_educado',
    PAGAMENTO_PONTUAL = 'pagamento_pontual',
    COMUNICACAO_CLARA = 'comunicacao_clara',
    FLEXIVEL_HORARIOS = 'flexivel_horarios',
    RESPEITOU_COMBINADO = 'respeitou_combinado'
}

export enum AspectoNegativo {
    PAGAMENTO_ATRASADO = 'pagamento_atrasado',
    COMUNICACAO_RUIM = 'comunicacao_ruim',
    CANCELOU_SEM_MOTIVO = 'cancelou_sem_motivo',
    DESRESPEITOU_HORARIO = 'desrespeitou_horario',
    PEDIDO_URGENTE = 'pedido_urgente',
    NEGOCIACAO_DIFÍCIL = 'negociacao_dificil'
}

export interface EstatisticasRanking {
    nivel_atual: NivelRanking;
    score_atual: number;
    total_avaliacoes: number;
    aspectos_positivos: {
        aspecto: AspectoPositivo;
        quantidade: number;
        percentual: number;
    }[];
    aspectos_negativos: {
        aspecto: AspectoNegativo;
        quantidade: number;
        percentual: number;
    }[];
}

export interface ConfiguracaoScore {
    aspecto: AspectoPositivo | AspectoNegativo;
    pontos: number;
    tipo: 'positivo' | 'negativo';
} 