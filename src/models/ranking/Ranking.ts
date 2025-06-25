import mongoose, { Schema, Document } from 'mongoose';
import { RankingUsuario, NivelRanking } from '../../types/rankingType';

export interface IRankingUsuario extends RankingUsuario, Document {}

const rankingUsuarioSchema = new Schema<IRankingUsuario>({
    id_usuario: {
        type: String,
        required: true,
        unique: true
    },
    score: {
        type: Number,
        required: true,
        default: 50, // Score inicial neutro
        min: 0,
        max: 100
    },
    nivel: {
        type: String,
        enum: Object.values(NivelRanking),
        required: true,
        default: NivelRanking.BRONZE
    },
    total_avaliacoes: {
        type: Number,
        required: true,
        default: 0
    },
    data_criacao: {
        type: Date,
        default: Date.now
    },
    data_atualizacao: {
        type: Date,
        default: Date.now
    }
});

// Middleware para atualizar a data de modificação
rankingUsuarioSchema.pre('save', function(next) {
    this.data_atualizacao = new Date();
    next();
});

export const RankingUsuarioModel = mongoose.model<IRankingUsuario>('RankingUsuario', rankingUsuarioSchema); 