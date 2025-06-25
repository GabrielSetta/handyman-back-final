import mongoose, { Schema, Document } from 'mongoose';
import { AspectoPositivo, AspectoNegativo } from '../../types/rankingType';

export interface IAvaliacaoUsuario extends Document {
    id_usuario: string;
    id_fornecedor: string;
    id_servico: string;
    aspectos_positivos: AspectoPositivo[];
    aspectos_negativos: AspectoNegativo[];
    comentario?: string;
    data_avaliacao: Date;
}

const avaliacaoUsuarioSchema = new Schema<IAvaliacaoUsuario>({
    id_usuario: {
        type: String,
        required: true
    },
    id_fornecedor: {
        type: String,
        required: true
    },
    id_servico: {
        type: String,
        required: true
    },
    aspectos_positivos: [{
        type: String,
        enum: Object.values(AspectoPositivo)
    }],
    aspectos_negativos: [{
        type: String,
        enum: Object.values(AspectoNegativo)
    }],
    comentario: {
        type: String,
        maxlength: 500
    },
    data_avaliacao: {
        type: Date,
        default: Date.now
    }
});

// Índices para melhor performance
avaliacaoUsuarioSchema.index({ id_usuario: 1 });
avaliacaoUsuarioSchema.index({ id_servico: 1 });
avaliacaoUsuarioSchema.index({ data_avaliacao: -1 });

export const AvaliacaoUsuarioModel = mongoose.model<IAvaliacaoUsuario>('AvaliacaoUsuario', avaliacaoUsuarioSchema); 